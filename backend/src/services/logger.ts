import { Session } from "../models/SessionModel.js";
import {getSessionByToken} from "./sessionService.js";

function dateString(): string {
    // 21.09.2021 12:34:56
    const date = new Date();
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export function log(message: string): void {
    console.log(`${dateString()}:\t ${message}`);
}

export function logSesstionDetails(sessionToken: string, message: string): void {
    const session = getSessionByToken(sessionToken);
    if (!session) {
        console.log(`${dateString()}:\t Session: ${sessionToken} - ${message}`);
        return;
    }
    console.log(`${dateString()}:\t Session: ${sessionToken} - ${message}`, sessionToString(session));
}

function sessionToString(session: Session): string {
    return `${session.name} (${session.token}) with ${session.players.length} players:
    [${session.players.reduce((prev, current) => prev + `(name: ${current.name}),`, '')}]
    Open: ${session.open}`;
}

export function veryImportantMessage(message: string) {
    console.log('');
    console.log('--------------------------------');
    console.log('');
    log(message);
    console.log('');
    console.log('--------------------------------');
    console.log('');
}