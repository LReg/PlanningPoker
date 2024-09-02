import {ExportEstimateSession, Session} from "../models/SessionModel.js";
import { sendMessageToSession } from "./socketService.js";
import {Player} from "../models/PlayerModel.js";
import { socketPlayers, io } from "./socketService.js";
import {log} from "./logger.js";

export const sessions: Session[] = [];

export const checkIsOwnerByToken = (userToken: string, session: Session): boolean => {
    return session.players.find((player) => player.token === userToken)?.isOwner ?? false;
}

export const checkIsOwnerById = (userId: string, session: Session): boolean => {
    return session.players.find((player) => player.id === userId)?.isOwner ?? false;
}

export const getSessionInfo = (sessionToken: string) => {
    const session = sessions.find((session) => session.token === sessionToken);
    if (session) {
        const open = session.open;
        return {
            token: session.token,
            name: session.name,
            open: session.open,
            players: session.players.map((player) => {
                return {
                    name: player.name,
                    id: player.id,
                    estimate: open ? player.estimate : (player.estimate === null ? null : -1),
                    isOwner: player.isOwner,
                };
            })
        } as ExportEstimateSession;
    }
    else {
        return null;
    }
}

export const mapPersonalPlayerExport = (player: Player) => {
    return {
        name: player.name,
        id: player.id,
        estimate: player.estimate,
        token: player.token,
        isOwner: player.isOwner,
    };
}

export const setPlayerTimers = (sessionToken: string, playerToken: string) => {
    const player = sessions.find((session) => session.token === sessionToken)?.players.find((player) => player.token === playerToken);
    if (!player) {
        throw new Error('Player not found');
    }
    player.timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    player.timeoutIds.push(setTimeout(() => {
        io.to(socketPlayers[playerToken]).emit('kicked');
        try {
            playerLeave(sessionToken, playerToken);
            log('player leave after timeout for ' + player.name);
        } catch (e) {
            log('playerLeave failed (probably because session not found, or player already left)');
        }
    }, 1000 * 60 * 60));  // 1 hour
    player.timeoutIds.push(setTimeout(() => {
        log('kickWarning for ' + player.name);
        io.to(socketPlayers[playerToken]).emit('kickWarning');
    }, (1000 * 60 * 60) - (1000 * 60 * 5)));  // 5 minutes before kick
}

export const activateSessionDeletion = (session: Session) => {
    log('activateSessionDeletion for ' + session.token);
    if (session.timeoutId) {
        clearTimeout(session.timeoutId);
        session.timeoutId = undefined;
    }
    session.timeoutId = setTimeout(() => {
        if (session?.players.length === 0) {
            sessions.splice(sessions.indexOf(session), 1);
            log('session ' + session.token + ' deleted');
        }
    }, 1000 * 60 * 60 * 24 * 10); // 10 days
}

export const clearSessionDeletion = (session: Session) => {
    log('clearSessionDeletion for ' + session.token);
    if (session.timeoutId) {
        clearTimeout(session.timeoutId);
        session.timeoutId = undefined;
    }
}

const handAdminOver = (session: Session, player: Player) => {
    if (session.players.length > 1) {
        const newOwner = session.players.find((p) => p.id !== player.id);
        if (newOwner) {
            newOwner.isOwner = true;
            io.to(socketPlayers[newOwner.token]).emit('updateUserinfo');
            sendMessageToSession(session.token, newOwner.name + ' ist jetzt der Sitzungsleiter.');
            log('handAdminOver: ' + newOwner.name + ' is now the session owner');
        }
    }
}

export const playerLeave = (sessionToken: string, playerToken: string) => {
    const session = getSessionByToken(sessionToken);
    const player = getPlayerByToken(playerToken, sessionToken);

    if (!player) {
        throw new Error('Player not found');
    }

    if (player.isOwner && session)
       handAdminOver(session, player);

    if (session) {
        session.players = session.players.filter((player) => player.token !== playerToken);
        io.to(sessionToken).emit('playerLeft', getSessionInfo(sessionToken));
        sendMessageToSession(sessionToken, player?.name + ' hat die Sitzung verlassen.');
        if (session.players.length === 0) {
            activateSessionDeletion(session);
        }
    } else {
        throw new Error('Session not found');
    }
}

export const playerKick = (sessionToken: string, playerToken: string) => {
    const session = getSessionByToken(sessionToken);
    const player = getPlayerByToken(playerToken, sessionToken);

    if (!player) {
        throw new Error('Player not found');
    }

    if (session) {
        session.players = session.players.filter((player) => player.token !== playerToken);
        io.to(sessionToken).emit('playerKicked', getSessionInfo(sessionToken));
        io.to(socketPlayers[playerToken]).emit('kicked');
        sendMessageToSession(sessionToken, player?.name + ' wurde von ' + session.players.find((player) => player.isOwner)?.name + ' zum Zuschauer gemacht.');
    } else {
        throw new Error('Session not found');
    }
}

export const kick = (playerToKick: Player, sessionToken: string) => {
    const session = getSessionByToken(sessionToken);
    if (session) {
        playerKick(session.token, playerToKick.token);
    }
    else {
        throw new Error('Session not found');
    }
}

export const getPlayerById = (playerId: string, sessionToken: string): Player | undefined => {
    const session = sessions.find((session) => session.token === sessionToken);
    return session?.players.find((player) => player.id === playerId);
}

export const getPlayerByToken = (playerToken: string, sessionToken: string): Player | undefined => {
    const session = sessions.find((session) => session.token === sessionToken);
    return session?.players.find((player) => player.token === playerToken);
}

export const getSessionByToken = (sessionToken: string): Session | undefined => {
    return sessions.find((session) => session.token === sessionToken);
}

export const shake = (session: Session, player: Player) => {
    io.to(socketPlayers[player.token]).emit('shake');
}

export const throwEmojiAt = (session: Session, player: Player, emoji: string) => {
    io.to(session.token).emit('throw', player.id, emoji);
}
