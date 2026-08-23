import { redis, redisKey } from '../redisClient.js';

/**
 * Maps a player's stable token to their current Socket.io socket id, and back. Was a plain JS
 * object — fine at one replica, but a pod resolving "which socket does this player have right
 * now" needs to see players who connected via a *different* pod. Redis-backed, same function
 * signatures as before (now async).
 *
 * Once the Socket.io Redis adapter is attached (socketService.ts), io.to(socketId).emit(...)
 * already works cluster-wide — a socket's own id is an implicit room every adapter-connected
 * node can address. This only has to make the id itself resolvable from any pod.
 */

function playerSocketKey(playerToken: string): string {
    return redisKey('socket-player', playerToken);
}

function socketPlayerKey(socketId: string): string {
    return redisKey('player-socket', socketId);
}

export async function storePlayerToken(playerToken: string, socketId: string): Promise<void> {
    await redis().set(playerSocketKey(playerToken), socketId);
    await redis().set(socketPlayerKey(socketId), playerToken);
}

export async function getSocketIdForPlayer(playerToken: string): Promise<string | null> {
    return redis().get(playerSocketKey(playerToken));
}

export async function getPlayerTokenFromSocketId(socketId: string): Promise<string | null> {
    return redis().get(socketPlayerKey(socketId));
}

export async function clearPlayerSocket(playerToken: string, socketId: string): Promise<void> {
    await redis().del(playerSocketKey(playerToken));
    await redis().del(socketPlayerKey(socketId));
}
