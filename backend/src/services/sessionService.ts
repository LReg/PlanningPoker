import {ExportEstimateSession, Session} from "../models/SessionModel.js";
import {Player} from "../models/PlayerModel.js";
import { io } from "./socket/socketService.js";
import {log} from "./logger.js";
import {getSocketIdForPlayer} from "./socket/socketDataService.js";
import {sendMessageStrFromServer} from "./socket/socketSendService.js";
import {
    cancelExpiry,
    clearPlayerIndex,
    createSession as storeCreateSession,
    expireIfEmpty,
    getSession,
    getSessionTokenForPlayer,
    listActiveSessionTokens,
    setPlayerIndex,
    withSession,
} from "./sessionStore.js";

export const checkIsOwnerByToken = (userToken: string, session: Session): boolean => {
    return session.players.find((player) => player.token === userToken)?.isOwner ?? false;
}

export const checkIsOwnerById = (userId: string, session: Session): boolean => {
    return session.players.find((player) => player.id === userId)?.isOwner ?? false;
}

/** Pure — builds the export shape from an already-loaded session, no Redis round-trip. Use this
 *  right after a withSession mutation instead of getSessionInfo(token), which re-fetches. */
export const getSessionInfoFrom = (session: Session): ExportEstimateSession => {
    const open = session.open;
    return {
        token: session.token,
        name: session.name,
        open: session.open,
        estimationOptions: session.estimationOptions,
        estimationValues: session.estimationValues,
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

export const getSessionInfo = async (sessionToken: string): Promise<ExportEstimateSession | null> => {
    const session = await getSession(sessionToken);
    return session ? getSessionInfoFrom(session) : null;
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

/** Registers a brand-new session (and its initial players' player->session index entries). */
export const createSession = async (session: Session): Promise<void> => {
    await storeCreateSession(session);
}

/** Adds a joining player to an existing session's player->session index — the session document
 *  mutation itself (pushing the Player) happens via withSession at the call site. */
export const registerPlayer = async (sessionToken: string, playerToken: string): Promise<void> => {
    await setPlayerIndex(playerToken, sessionToken);
}

const handAdminOver = async (session: Session, player: Player) => {
    if (session.players.length > 1) {
        const newOwner = session.players.find((p) => p.id !== player.id);
        if (newOwner) {
            newOwner.isOwner = true;
            const socketId = await getSocketIdForPlayer(newOwner.token);
            if (socketId) {
                io.to(socketId).emit('updateUserinfo');
            }
            sendMessageStrFromServer(session.token, newOwner.name + ' ist jetzt der Sitzungsleiter.');
            log('handAdminOver: ' + newOwner.name + ' is now the session owner');
        }
    }
}

export const playerLeave = async (sessionToken: string, playerToken: string): Promise<void> => {
    const result = await withSession(sessionToken, async (session) => {
        const player = session.players.find((p) => p.token === playerToken);
        if (!player) {
            throw new Error('Player not found');
        }
        if (player.isOwner) {
            await handAdminOver(session, player);
        }
        session.players = session.players.filter((p) => p.token !== playerToken);
        return { player, playersLeft: session.players.length };
    });

    if (!result) {
        throw new Error('Session not found');
    }

    await clearPlayerIndex(playerToken);
    io.to(sessionToken).emit('playerLeft', await getSessionInfo(sessionToken));
    sendMessageStrFromServer(sessionToken, result.player.name + ' hat die Sitzung verlassen.');
    if (result.playersLeft === 0) {
        await expireIfEmpty(sessionToken);
    }
}

export const playerKick = async (sessionToken: string, playerToken: string): Promise<void> => {
    const result = await withSession(sessionToken, (session) => {
        const player = session.players.find((p) => p.token === playerToken);
        if (!player) {
            throw new Error('Player not found');
        }
        session.players = session.players.filter((p) => p.token !== playerToken);
        return { player, owner: session.players.find((p) => p.isOwner) };
    });

    if (!result) {
        throw new Error('Session not found');
    }

    await clearPlayerIndex(playerToken);
    io.to(sessionToken).emit('playerKicked', await getSessionInfo(sessionToken));
    const socketId = await getSocketIdForPlayer(playerToken);
    if (socketId) {
        io.to(socketId).emit('kicked');
    }
    sendMessageStrFromServer(sessionToken, result.player?.name + ' wurde von ' + result.owner?.name + ' zum Zuschauer gemacht.');
}

export const kick = async (playerToKick: Player, sessionToken: string): Promise<void> => {
    const session = await getSession(sessionToken);
    if (session) {
        await playerKick(session.token, playerToKick.token);
    }
    else {
        throw new Error('Session not found');
    }
}

export const getPlayerById = async (playerId: string, sessionToken: string): Promise<Player | undefined> => {
    const session = await getSession(sessionToken);
    return session?.players.find((player) => player.id === playerId);
}

export const getPlayerByToken = async (playerToken: string, sessionToken: string): Promise<Player | undefined> => {
    const session = await getSession(sessionToken);
    return session?.players.find((player) => player.token === playerToken);
}

export async function getSessionTokenByPlayerToken(playerToken: string): Promise<string | null> {
    return getSessionTokenForPlayer(playerToken);
}

export const getSessionByToken = async (sessionToken: string): Promise<Session | undefined> => {
    const session = await getSession(sessionToken);
    return session ?? undefined;
}

/** Cancels a pending empty-session expiry — call whenever a player (re)joins. */
export const clearSessionDeletion = async (sessionToken: string): Promise<void> => {
    await cancelExpiry(sessionToken);
}

export const shake = async (player: Player): Promise<void> => {
    const socketId = await getSocketIdForPlayer(player.token);
    if (socketId) {
        io.to(socketId).emit('shake');
    }
}

export const flashbang = async (player: Player): Promise<void> => {
    const socketId = await getSocketIdForPlayer(player.token);
    if (socketId) {
        io.to(socketId).emit('flashbang');
    }
}

export const throwEmojiAt = (session: Session, player: Player, emoji: string) => {
    io.to(session.token).emit('throw', player.id, emoji);
}

/** Replaces the old setPlayerTimers() timer-reset for callers (chat) that don't otherwise
 *  mutate the session — resets the sweep's idle clock and clears a pending kick-warning. */
export const touchPlayerActivity = async (sessionToken: string, playerToken: string): Promise<void> => {
    await withSession(sessionToken, (session) => {
        const player = session.players.find((p) => p.token === playerToken);
        if (player) {
            player.lastAction = new Date();
            player.warningIssued = false;
        }
    });
}

/** GET /debug — every session, unfiltered. */
export const getAllSessions = async (): Promise<Session[]> => {
    const tokens = await listActiveSessionTokens();
    const sessions = await Promise.all(tokens.map((token) => getSession(token)));
    return sessions.filter((s): s is Session => s !== null);
}

/** GET /currentActiveSessions */
export const getSessionStats = async (): Promise<{ total: number; active: number }> => {
    const sessions = await getAllSessions();
    return {
        total: sessions.length,
        active: sessions.filter((session) => session.players.length > 0).length,
    };
}
