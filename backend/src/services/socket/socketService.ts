import {Server} from "socket.io";
import http from "http";
import express from "express";
import {createAdapter} from "@socket.io/redis-adapter";
import Redis from "ioredis";
import {createRedisConnection} from "../redisClient.js";
import {Message} from "../../models/Message.model";
import {handleNewChatMessage} from "./chat-service.js";
import {
    clearPlayerSocket,
    getPlayerTokenFromSocketId,
    storePlayerToken,
} from "./socketDataService.js";
export const app = express();
export const server = http.createServer(app);

console.log(`${process.env.PROTOCOL}://${process.env.DOMAIN}`);
export const io = new Server(server, {
    cors: {
        origin: [`${process.env.PROTOCOL}://${process.env.DOMAIN}`, "http://localhost"],
    }
});

/**
 * Without this, io.to(room).emit(...) only reaches sockets connected to *this* pod — every other
 * pod's players never see the event. Two dedicated ioredis connections: a subscriber connection
 * can issue no other commands, same reason musik-star's RedisIoAdapter uses two.
 *
 * Must resolve before server.listen() (see index.ts) — a socket accepted before the adapter is
 * attached would be invisible to the other pods.
 */
export async function attachRedisAdapter(): Promise<void> {
    const pubClient = createRedisConnection('socket-pub');
    const subClient = createRedisConnection('socket-sub');
    await Promise.all([waitForReady(pubClient), waitForReady(subClient)]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.io Redis adapter connected');
}

function waitForReady(client: Redis): Promise<void> {
    if (client.status === 'ready') {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        client.once('ready', () => resolve());
        client.once('error', reject);
    });
}

io.on('connection', (socket) => {
    socket.on('joinSession', (sessionToken, playertoken) => {
        if (playertoken && sessionToken) {
            socket.join(sessionToken);
            void storePlayerToken(playertoken, socket.id);
        }
    });
    socket.on('chat', (message: Message) => {
        void handleNewChatMessage(socket.id, message);
    });
    socket.on('leaveSession', () => {
        void disconnectSocket(socket.id);
    });
    socket.on('disconnect', () => {
        void disconnectSocket(socket.id);
    });
});

async function disconnectSocket(socketId: string): Promise<void> {
    const playerToken = await getPlayerTokenFromSocketId(socketId);
    if (playerToken) {
        await clearPlayerSocket(playerToken, socketId);
    }
}
