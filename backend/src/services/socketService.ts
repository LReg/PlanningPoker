import {Server} from "socket.io";
import http from "http";
import express from "express";
import {Message} from "../models/Message.model";
import {EstimationHistogram} from "../models/EstimationHistogram";
export const app = express();
export const server = http.createServer(app);
export const socketPlayers: { [key: string]: string } = {};

console.log(`${process.env.PROTOCOL}://${process.env.DOMAIN}`);
export const io = new Server(server, {
    cors: {
        origin: [`${process.env.PROTOCOL}://${process.env.DOMAIN}`, "http://localhost"],
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
export function sendHistogramToSession(sessionToken: string, histogram: EstimationHistogram) {
    io.to(sessionToken).emit('newHistogram', histogram);
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
