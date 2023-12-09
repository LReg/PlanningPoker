import {Server} from "socket.io";
import http from "http";
import express from "express";
import {Message} from "../models/Message.model";
export const app = express();
export const server = http.createServer(app);
export const socketPlayers: { [key: string]: string } = {};

export const io = new Server(server, {
    cors: {
        origin: ["https://YOURDOMAIN", "http://localhost:5173"],
    }
});

export function sendMessageToSession(sessionToken: string, message: string) {
    const messageObj = {
        message: message,
        name: 'Server',
        timestamp: new Date().getTime()
    }
    io.to(sessionToken).emit('newMessage', messageObj);
}

io.on('connection', (socket) => {
    socket.on('joinSession', (token, playertoken) => {
        socket.join(token);
        if (playertoken) {
            socketPlayers[playertoken] = socket.id;
        }
    });
    socket.on('chat', (message: Message, sessionToken) => {
        socket.to(sessionToken).emit('newMessage', message);
    });
    socket.on('leaveSession', (token) => {
        socket.leave(token);
        const playerToken = Object.keys(socketPlayers).find((key) => socketPlayers[key] === socket.id);
        if (playerToken) {
            delete socketPlayers[playerToken];
        }
    });
    socket.on('disconnect', () => {
        // TODO dont know what to do yet
    });
});
