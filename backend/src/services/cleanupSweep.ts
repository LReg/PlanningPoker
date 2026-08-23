import { redis, redisKey } from './redisClient.js';
import { listActiveSessionTokens, withSession } from './sessionStore.js';
import { getSocketIdForPlayer } from './socket/socketDataService.js';
import { io } from './socket/socketService.js';
import { playerLeave } from './sessionService.js';
import { log } from './logger.js';

/**
 * Replaces the old per-player setTimeout pair (kick after 1h idle, warn 5min before) — those
 * were live Timeout handles stored inside the Player object, which can't survive a session
 * moving into Redis, and even left alone would only ever fire on whichever pod happened to set
 * them. This is the same shape as musik-star's SessionCleanupService: a leader-locked interval,
 * so only one pod does the work per tick regardless of replica count.
 */
const SWEEP_INTERVAL_MS = 60 * 1000;
const LOCK_KEY = redisKey('cleanup-sweep-lock');
const LOCK_TTL_MS = 55 * 1000; // shorter than the interval, so a crashed holder's lock still
                                // frees up in time for the next tick to run somewhere.
const WARNING_AFTER_MS = 55 * 60 * 1000;
const KICK_AFTER_MS = 60 * 60 * 1000;

const RELEASE_LOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

let timer: ReturnType<typeof setInterval> | undefined;

export function startCleanupSweep(): void {
    timer = setInterval(() => void sweep(), SWEEP_INTERVAL_MS);
}

export function stopCleanupSweep(): void {
    if (timer) {
        clearInterval(timer);
    }
}

async function sweep(): Promise<void> {
    const holder = `${process.pid}-${Date.now()}`;
    const acquired = await redis().set(LOCK_KEY, holder, 'PX', LOCK_TTL_MS, 'NX');
    if (acquired !== 'OK') {
        return;
    }
    try {
        const tokens = await listActiveSessionTokens();
        for (const token of tokens) {
            await sweepSession(token);
        }
    } catch (error) {
        console.error('cleanupSweep failed:', error);
    } finally {
        await redis().eval(RELEASE_LOCK_SCRIPT, 1, LOCK_KEY, holder);
    }
}

async function sweepSession(sessionToken: string): Promise<void> {
    const now = Date.now();
    const toWarn: string[] = [];
    const toKick: string[] = [];

    await withSession(sessionToken, (session) => {
        for (const player of session.players) {
            const idleMs = now - new Date(player.lastAction).getTime();
            if (idleMs > KICK_AFTER_MS) {
                toKick.push(player.token);
            } else if (idleMs > WARNING_AFTER_MS && !player.warningIssued) {
                player.warningIssued = true;
                toWarn.push(player.token);
            }
        }
    });

    for (const playerToken of toWarn) {
        const socketId = await getSocketIdForPlayer(playerToken);
        if (socketId) {
            io.to(socketId).emit('kickWarning');
        }
        log(`kickWarning for player ${playerToken} in session ${sessionToken}`);
    }

    // Idle timeout is a soft "left on their own", not an owner-initiated kick — same distinction
    // the old setTimeout body made: emit 'kicked' to just this player, then playerLeave() for
    // the rest (admin handoff, the 'playerLeft' broadcast, empty-session expiry). playerKick()
    // is reserved for the explicit "owner removes a player" REST endpoint.
    for (const playerToken of toKick) {
        const socketId = await getSocketIdForPlayer(playerToken);
        if (socketId) {
            io.to(socketId).emit('kicked');
        }
        try {
            await playerLeave(sessionToken, playerToken);
            log(`player ${playerToken} removed after idle timeout in session ${sessionToken}`);
        } catch (error) {
            log(`playerLeave failed during sweep (likely already left): ${String(error)}`);
        }
    }
}
