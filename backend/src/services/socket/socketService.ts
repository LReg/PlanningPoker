import {Server} from "socket.io";
import http from "http";
import express from "express";
import {Message} from "../../models/Message.model";
import {handleNewChatMessage} from "./chat-service.js";
import {
    getPlayerTokenFromSocketId,
    socketPlayers,
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

io.on('connection', (socket) => {
    socket.on('joinSession', (sessionToken, playertoken) => {
        if (playertoken && sessionToken) {
            socket.join(sessionToken);
            storePlayerToken(playertoken, socket.id)
        }
    });
    socket.on('chat', (message: Message) => {
        handleNewChatMessage(socket.id, message)
    });
    socket.on('leaveSession', (token) => {
        const playerToken = getPlayerTokenFromSocketId(socket.id);
        if (playerToken) {
            delete socketPlayers[playerToken];
        }
    });
    socket.on('disconnect', () => {
        const playerToken = getPlayerTokenFromSocketId(socket.id);
        if (playerToken) {
            delete socketPlayers[playerToken];
        }
    });
});
