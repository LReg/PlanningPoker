import { redis, redisKey } from './redisClient.js';
import { Session } from '../models/SessionModel.js';

/** Empty sessions used to get a 20-day setTimeout before deletion; same window, now a Redis TTL
 *  on the key itself instead — survives a pod restart, which used to silently cancel it. */
const EMPTY_SESSION_TTL_SECONDS = 60 * 60 * 24 * 20;

const LOCK_TTL_MS = 3000;
const LOCK_RETRY_DELAY_MS = 50;
const LOCK_MAX_ATTEMPTS = 10;

const RELEASE_LOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

const SESSIONS_INDEX_KEY = redisKey('sessions');

function sessionKey(token: string): string {
    return redisKey('session', token);
}

function lockKey(token: string): string {
    return redisKey('session-lock', token);
}

function playerIndexKey(playerToken: string): string {
    return redisKey('player', playerToken);
}

export class LockNotAcquiredError extends Error {}

/** Read-only — no lock. Safe for anything that isn't about to mutate the session. */
export async function getSession(token: string): Promise<Session | null> {
    const raw = await redis().get(sessionKey(token));
    return raw ? (JSON.parse(raw) as Session) : null;
}

async function saveSession(session: Session): Promise<void> {
    await redis().set(sessionKey(session.token), JSON.stringify(session));
}

export async function createSession(session: Session): Promise<void> {
    await saveSession(session);
    await redis().sadd(SESSIONS_INDEX_KEY, session.token);
    await Promise.all(session.players.map((p) => setPlayerIndex(p.token, session.token)));
}

export async function deleteSession(token: string): Promise<void> {
    await redis().del(sessionKey(token));
    await redis().srem(SESSIONS_INDEX_KEY, token);
}

/** Tokens of every session that currently has a saved key — what cleanupSweep.ts iterates. */
export async function listActiveSessionTokens(): Promise<string[]> {
    return redis().smembers(SESSIONS_INDEX_KEY);
}

export async function setPlayerIndex(playerToken: string, sessionToken: string): Promise<void> {
    await redis().set(playerIndexKey(playerToken), sessionToken);
}

export async function clearPlayerIndex(playerToken: string): Promise<void> {
    await redis().del(playerIndexKey(playerToken));
}

/** Replaces the old O(n) scan over an in-memory `sessions` array with an O(1) index read. */
export async function getSessionTokenForPlayer(playerToken: string): Promise<string | null> {
    return redis().get(playerIndexKey(playerToken));
}

/** Called once a session's player count hits 0 — same 20-day grace period as before. */
export async function expireIfEmpty(token: string): Promise<void> {
    await redis().expire(sessionKey(token), EMPTY_SESSION_TTL_SECONDS);
}

/** Called whenever a player (re)joins — cancels a pending empty-session expiry. */
export async function cancelExpiry(token: string): Promise<void> {
    await redis().persist(sessionKey(token));
}

async function acquireLock(token: string, holder: string): Promise<boolean> {
    const result = await redis().set(lockKey(token), holder, 'PX', LOCK_TTL_MS, 'NX');
    return result === 'OK';
}

/** Only releases a lock this call still holds — a lock outlived by a slow mutation must be left
 *  for its TTL to expire rather than deleted out from under whoever has since acquired it. Same
 *  compare-and-delete shape as musik-star's SessionCleanupService lock. */
async function releaseLock(token: string, holder: string): Promise<void> {
    await redis().eval(RELEASE_LOCK_SCRIPT, 1, lockKey(token), holder);
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The only way any code should mutate a session going forward. Loads it, hands it to `fn` for
 * plain in-memory mutation (exactly like the old direct-field-mutation code did), saves the
 * result, all under a short-lived Redis lock — so two concurrent requests for the same session
 * (two players estimating around the same moment, landing on different pods) can't lose an
 * update to each other.
 *
 * Returns null if the session doesn't exist (fn is never called, nothing is saved). Throws
 * LockNotAcquiredError if the lock can't be acquired after a few quick retries — expected to be
 * rare and brief, so no heartbeating: every mutation here is a couple of Redis round-trips, not
 * the minutes-long holds huntcontrol's job lock has to survive.
 */
export async function withSession<T>(
    token: string,
    fn: (session: Session) => T | Promise<T>,
): Promise<T | null> {
    const holder = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let acquired = false;
    for (let attempt = 0; attempt < LOCK_MAX_ATTEMPTS; attempt++) {
        acquired = await acquireLock(token, holder);
        if (acquired) {
            break;
        }
        await sleep(LOCK_RETRY_DELAY_MS);
    }
    if (!acquired) {
        throw new LockNotAcquiredError(`Could not acquire lock for session ${token}`);
    }
    try {
        const session = await getSession(token);
        if (!session) {
            return null;
        }
        const result = await fn(session);
        // Always re-saved, even when fn only validated and made no change — a harmless idempotent
        // overwrite, and far simpler than threading a "did anything change" flag through every
        // caller just to skip it.
        await saveSession(session);
        return result;
    } finally {
        await releaseLock(token, holder);
    }
}
