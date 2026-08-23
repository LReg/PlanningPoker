import Redis from 'ioredis';

/**
 * Unlike huntcontrol/musik-star, Redis isn't an optional coordination layer here — it's the
 * primary store for session/player state (services/sessionStore.ts). There's no second store to
 * fall back to, so REDIS_URL is a hard boot-time requirement: fail fast rather than silently
 * running with nothing.
 */
const KEY_PREFIX = 'planning-poker:';

let mainClient: Redis | null = null;

export function redisKey(...parts: string[]): string {
    return KEY_PREFIX + parts.join(':');
}

/** A fresh connection — the Socket.io adapter needs two of its own (a subscriber connection can
 *  issue no other commands). */
export function createRedisConnection(name: string): Redis {
    const url = process.env.REDIS_URL;
    if (!url) {
        throw new Error('REDIS_URL is required');
    }
    const client = new Redis(url, {
        connectionName: `planning-poker-${name}`,
        maxRetriesPerRequest: 3,
    });
    client.on('error', (err) => {
        console.error(`Redis connection "${name}" error: ${err.message}`);
    });
    return client;
}

function waitForReady(client: Redis): Promise<void> {
    if (client.status === 'ready') {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        client.once('ready', resolve);
        client.once('error', reject);
    });
}

export async function initRedis(): Promise<void> {
    mainClient = createRedisConnection('main');
    await waitForReady(mainClient);
    console.log('Connected to Redis');
}

/** The shared client for session/index reads and writes. Throws if called before initRedis()
 *  resolves — every caller runs after bootstrap has awaited it, so this is a programming-error
 *  guard, not a real runtime path. */
export function redis(): Redis {
    if (!mainClient) {
        throw new Error('Redis not initialized — initRedis() must be awaited before use');
    }
    return mainClient;
}

export async function closeRedis(): Promise<void> {
    const client = mainClient;
    mainClient = null;
    if (client) {
        try {
            await client.quit();
        } catch {
            client.disconnect();
        }
    }
}
