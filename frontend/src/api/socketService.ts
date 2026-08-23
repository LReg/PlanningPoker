import {io, Socket} from "socket.io-client";
import env from "@/environments/environments";

export let socket: Socket | null = null;

export function socketExit() {
    socket?.disconnect();
    socket = null;
}

export function socketConnect() {
    // websocket-only: with the backend now behind more than one replica (see
    // ../../../HORIZONTAL-SCALING-GAP.md), Engine.IO's default long-polling handshake is several
    // HTTP requests, and the backend Service load-balances per TCP connection, not per request —
    // a handshake that splits across pods gets "Session ID unknown" (code 1) from whichever pod
    // didn't see the earlier request. A websocket upgrade is a single request, so the connection
    // stays with whichever pod accepted it for its whole lifetime and needs no sticky-session
    // infra. Trade-off accepted deliberately, same choice huntcontrol/musik-star made: a client
    // behind a proxy that blocks websockets gets no realtime at all rather than falling back to
    // polling.
    socket = io(env.socketAddress, {transports: ['websocket']});
}
