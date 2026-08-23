import 'dotenv/config';
import express from 'express';
import sessionRouter from './routers/sessionRouter.js';
import { server, app, attachRedisAdapter } from './services/socket/socketService.js';
import {userRequestRouter} from "./routers/userRequestRouter.js";
import { initRedis, closeRedis } from './services/redisClient.js';
import { startCleanupSweep, stopCleanupSweep } from './services/cleanupSweep.js';

const port = process.env.BACKEND_PORT;
export const debug = true;

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', `${process.env.PROTOCOL}://${process.env.DOMAIN}`);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization, content-type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
    next();
});

app.use(sessionRouter);
app.use(userRequestRouter);

app.options('*', (req, res) => {
    res.sendStatus(200);
});

async function bootstrap() {
    // Session/player state lives in Redis now (services/sessionStore.ts) — there's no
    // in-memory fallback to degrade to, so a missing/unreachable Redis fails boot outright
    // rather than starting in a broken state.
    await initRedis();
    // Must resolve before server.listen(): a socket accepted before the adapter is attached
    // would be invisible to any other replica.
    await attachRedisAdapter();
    startCleanupSweep();

    server.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}

void bootstrap();

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
        stopCleanupSweep();
        closeRedis()
            .catch((error: unknown) => console.error('Error closing Redis', error))
            .finally(() => process.exit(0));
    });
}
