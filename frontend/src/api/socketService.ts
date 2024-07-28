import {io, Socket} from "socket.io-client";
import env from "@/environments/environments";

export let socket: Socket | null = null;

export function socketExit() {
    socket?.disconnect();
    socket = null;
}

export function socketConnect() {
    socket = io(env.socketAdress);
}
