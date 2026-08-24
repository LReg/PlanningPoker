import {
    EstimationOption,
    FibonacciEstimationValues, getEstimationValues,
    NewSessionDto,
    parseEstimationType,
    Session
} from "../models/SessionModel.js";
import {Player} from "../models/PlayerModel.js";
import {nanoid} from "nanoid";
import express from "express";
import {
    checkIsOwnerById,
    checkIsOwnerByToken,
    clearSessionDeletion,
    createSession,
    getAllSessions,
    getPlayerById,
    getPlayerByToken,
    getSessionByToken,
    getSessionInfo,
    getSessionInfoFrom,
    getSessionStats,
    kick,
    mapPersonalPlayerExport,
    playerLeave,
    registerPlayer,
    shake,
    flashbang,
    throwEmojiAt
} from "../services/sessionService.js";
import {debug} from "../index.js";
import {io} from "../services/socket/socketService.js";
import {validateEstimate} from "../services/validationService.js";
import {createAndSendHistogram} from "../models/EstimationHistogram.js";
import {log, logSesstionDetails} from "../services/logger.js";
import {
    sendHistogramToSession,
    sendMessageStrFromServer
} from "../services/socket/socketSendService.js";
import {getSocketIdForPlayer} from "../services/socket/socketDataService.js";
import {withSession} from "../services/sessionStore.js";
import {asyncHandler} from "./asyncHandler.js";

const router = express.Router();

router.post('/debug', asyncHandler(async (req, res) => {
    if (debug) {
        console.log(await getAllSessions());
    }
    res.send('OK');
}));

router.post('/newSession', asyncHandler(async (req, res) => {
    const newSessionReq: NewSessionDto = req.body;
    const owner: Player = {
        estimate: null,
        name: newSessionReq.leaderName,
        id: nanoid(7),
        token: nanoid(25),
        isOwner: true,
        lastAction: new Date(),
    }
    const newSession: Session = {
        open: false,
        token: nanoid(5),
        name: newSessionReq.name,
        players: [owner],
        estimationOptions: EstimationOption.Fibonacci,
        estimationValues: FibonacciEstimationValues,
    }
    await createSession(newSession);
    res.send(newSession);
    void logSesstionDetails(newSession.token, 'new session created');
}));

router.post('/joinSession/:token', asyncHandler(async (req, res) => {
    const token = req.params.token;
    const player: Player = {
        name: req.body.name,
        id: nanoid(7),
        estimate: null,
        token: nanoid(25),
        isOwner: false,
        lastAction: new Date(),
    };
    const sessionInfo = await withSession(token, (session) => {
        if (session.players.length == 0) {
            player.isOwner = true;
        }
        session.players.push(player);
        return getSessionInfoFrom(session);
    });
    if (!sessionInfo) {
        res.status(404).send('Session not found');
        return;
    }
    await registerPlayer(token, player.token);
    io.to(token).emit('playerJoined', sessionInfo);
    res.send(player);
    sendMessageStrFromServer(token, player.name + ' ist der Sitzung beigetreten.');
    void logSesstionDetails(token, player.name + ' joined session ' + token);
    await clearSessionDeletion(token);
}));

router.post('/leaveSession/:token', asyncHandler(async (req, res) => {
    const token = req.params.token;
    const playerToken = req.body.token;
    const player = await getPlayerByToken(playerToken, token);
    try {
        await playerLeave(token, playerToken);
        res.send('OK');
        void logSesstionDetails(token, (player?.name ?? '?') + ' left session ' + token);
    } catch (e: any) {
        res.status(404).send(e.message);
    }
}));

// looks up is a session is closed and sends ExportUser oder ExportEstimateUser
router.get('/getSession/:token', asyncHandler(async (req, res) => {
    const token = req.params.token;
    const session = await getSessionInfo(token);
    if (session) {
        res.send(session);
        return;
    }
    else {
        res.status(404).send('Session not found');
    }
}));

router.put('/estimate/:token', asyncHandler(async (req, res) => {
    const token = req.params.token;
    const playerToken = req.body.token;
    const estimate = req.body.estimate;
    const validationSession = await getSessionByToken(token);

    if (!validationSession) {
        res.status(404).send('Session not found');
        return;
    }

    if (!validateEstimate(estimate, validationSession)) {
        res.status(400).send('Estimate not allowed');
        return;
    }

    const result = await withSession(token, (session) => {
        const player = session.players.find((p) => p.token === playerToken);
        if (!player) {
            return {found: false as const};
        }
        player.estimate = estimate;
        player.lastAction = new Date();
        player.warningIssued = false;
        return {found: true as const, session};
    });

    if (!result) {
        res.status(404).send('Session not found');
        return;
    }
    if (!result.found) {
        res.status(404).send('Player not found');
        return;
    }

    io.to(token).emit('playerEstimated', getSessionInfoFrom(result.session));
    res.send('OK');
    if (result.session.open) {
        createAndSendHistogram(result.session, token);
    }
}));

router.put('/changeEstimationOptions/:token', asyncHandler(async (req, res) => {
    const sessionToken = req.params.token;
    const userToken = req.body.userToken;

    let estimationOptions = req.body.custom;
    const estimationTypeString = req.body.estimationType;
    const estimationType = parseEstimationType(estimationTypeString);

    if (!estimationType) {
        res.status(400).send('Invalid estimation type');
        return;
    }

    if (estimationType === EstimationOption.Custom && (!estimationOptions || estimationOptions.length === 0)) {
        res.status(400).send('Custom estimation type requires options');
        return;
    }

    if (estimationType !== EstimationOption.Custom) {
        estimationOptions = getEstimationValues(estimationType);
    }

    const result = await withSession(sessionToken, (session) => {
        if (!checkIsOwnerByToken(userToken, session)) {
            return {status: 403 as const, message: 'Not owner'};
        }
        session.estimationOptions = estimationType;
        session.estimationValues = estimationOptions;
        session.players.forEach((player) => {
            player.estimate = null;
        });
        return {status: 200 as const, session};
    });

    if (!result) {
        res.status(404).send('Session not found');
        return;
    }
    if (result.status !== 200) {
        res.status(result.status).send(result.message);
        return;
    }

    io.to(sessionToken).emit('estimationOptionsChanged', getSessionInfoFrom(result.session));
    res.send('OK');
}));

router.put('/openSession/:token/:open', asyncHandler(async (req, res) => {
    const token = req.params.token;
    const userToken = req.body.token;
    const open = req.params.open === 'true';

    const result = await withSession(token, (session) => {
        const isInSession = session.players.find((player) => player.token === userToken) !== undefined;
        if (!isInSession) {
            return {status: 403 as const, message: 'Not in session'};
        }
        if (!checkIsOwnerByToken(userToken, session)) {
            return {status: 403 as const, message: 'Not owner'};
        }
        session.open = open;
        if (!open) {
            session.players.forEach((player) => {
                player.estimate = null;
            });
        }
        const player = session.players.find((p) => p.token === userToken);
        if (player) {
            player.lastAction = new Date();
            player.warningIssued = false;
        }
        return {status: 200 as const, session};
    });

    if (!result) {
        res.status(404).send('Session not found');
        return;
    }
    if (result.status !== 200) {
        res.status(result.status).send(result.message);
        return;
    }

    if (!open) {
        sendHistogramToSession(token, {estimationCount: {}});
    } else {
        createAndSendHistogram(result.session, token);
    }
    io.to(token).emit('sessionOpened', getSessionInfoFrom(result.session));
    log('Session opened: ' + token + ' - ' + open);
    res.send('OK');
}));

router.get('/isOwner/:token/:sessionToken', asyncHandler(async (req, res) => {
    const token = req.params.token;
    const sessionToken = req.params.sessionToken;
    const session = await getSessionByToken(sessionToken);
    if (session) {
        const player = await getPlayerByToken(token, sessionToken);
        if (player) {
            res.send(player.isOwner);
        }
        else {
            res.status(404).send('Player not found');
        }
    }
    else {
        res.status(404).send('Session not found');
    }
}));

router.get('/pullUserInfo/:token/:sessionToken', asyncHandler(async (req, res) => {
    const token = req.params.token;
    const sessionToken = req.params.sessionToken;
    const session = await getSessionByToken(sessionToken);

    if (session) {
        const player = await getPlayerByToken(token, sessionToken);
        if (player) {
            res.send(mapPersonalPlayerExport(player));
        }
        else {
            res.status(404).send('Player not found');
        }
    }
    else {
        res.status(404).send('Session not found');
    }
}));

router.post('/kickPlayer/:id/:sessionToken', asyncHandler(async (req, res) => {
    const kickId = req.params.id;
    const sessionToken = req.params.sessionToken;
    const playerToken = req.body.userToken;
    const session = await getSessionByToken(sessionToken);
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    const player = await getPlayerByToken(playerToken, sessionToken);
    const isOwner = checkIsOwnerByToken(playerToken, session!);

    if (!isOwner) {
        res.status(403).send('Not owner');
        return;
    }

    const playerToKickIsOwner = checkIsOwnerById(kickId, session!);
    if (playerToKickIsOwner) {
        res.status(400).send('You can not kick yourself.');
        return;
    }

    if (!player) {
        res.status(404).send('Player not found');
        return;
    }
    const playerToKick = await getPlayerById(kickId, session!.token);
    if (playerToKick) {
        await kick(playerToKick, sessionToken);
        log('Player kicked: ' + playerToKick.name);
    }
    else {
        res.status(404).send('Player not found');
        return;
    }
    res.send('OK');
}));

router.post('/shake/:id/:sessionToken', asyncHandler(async (req, res) => {
    const playerToken = req.body.userToken;
    const sessionToken = req.params.sessionToken;
    const shakeId = req.params.id;
    const session = await getSessionByToken(sessionToken);
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    const player = await getPlayerByToken(playerToken, sessionToken);
    const shakePlayer = await getPlayerById(shakeId, sessionToken);
    if (!player) {
        res.status(404).send('Player not found');
        return;
    }
    if (!shakePlayer) {
        res.status(404).send('Player to shake not found');
        return;
    }
    await shake(shakePlayer);
    res.send('OK');
}));

router.post('/flashbang/:id/:sessionToken', asyncHandler(async (req, res) => {
    const playerToken = req.body.userToken;
    const sessionToken = req.params.sessionToken;
    const flashId = req.params.id;
    const session = await getSessionByToken(sessionToken);
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    const player = await getPlayerByToken(playerToken, sessionToken);
    const flashPlayer = await getPlayerById(flashId, sessionToken);
    if (!player) {
        res.status(404).send('Player not found');
        return;
    }
    if (!flashPlayer) {
        res.status(404).send('Player to flashbang not found');
        return;
    }
    await flashbang(flashPlayer);
    res.send('OK');
}));

router.put('/makeAdmin/:sessionToken/:otherPlayerId', asyncHandler(async (req, res) => {
    const sessionToken = req.params.sessionToken;
    const otherPlayerId = req.params.otherPlayerId;
    const playerToken = req.body.userToken;

    const result = await withSession(sessionToken, (session) => {
        const player = session.players.find((p) => p.token === playerToken);
        const otherPlayer = session.players.find((p) => p.id === otherPlayerId);
        if (!player) {
            return {status: 404 as const, message: 'Player not found'};
        }
        if (!otherPlayer) {
            return {status: 404 as const, message: 'Player to make admin not found'};
        }
        if (!player.isOwner) {
            return {status: 403 as const, message: 'Not owner'};
        }
        otherPlayer.isOwner = true;
        player.isOwner = false;
        return {status: 200 as const, player, otherPlayer};
    });

    if (!result) {
        res.status(404).send('Session not found');
        return;
    }
    if (result.status !== 200) {
        res.status(result.status).send(result.message);
        return;
    }

    const [otherSocketId, playerSocketId] = await Promise.all([
        getSocketIdForPlayer(result.otherPlayer.token),
        getSocketIdForPlayer(result.player.token),
    ]);
    if (otherSocketId) {
        io.to(otherSocketId).emit('updateUserinfo');
    }
    if (playerSocketId) {
        io.to(playerSocketId).emit('updateUserinfo');
    }
    sendMessageStrFromServer(sessionToken, result.otherPlayer.name + ' ist jetzt der Sitzungsleiter.');
    log('Admin changed: ' + result.otherPlayer.name);
    res.send('OK');
}));

router.post('/throw/:id/:sessionToken', asyncHandler(async (req, res) => {
    const playerToken = req.body.userToken;
    const emoji = req.body.emoji;
    const sessionToken = req.params.sessionToken;
    const shakeId = req.params.id;
    const session = await getSessionByToken(sessionToken);
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    const player = await getPlayerByToken(playerToken, sessionToken);
    const throwPlayer = await getPlayerById(shakeId, sessionToken);
    if (!player) {
        res.status(404).send('Player not found');
        return;
    }
    if (!throwPlayer) {
        res.status(404).send('Player to throw paper at not found');
        return;
    }
    throwEmojiAt(session, throwPlayer, emoji);
    res.send('OK');
}));

router.get('/currentActiveSessions', asyncHandler(async (req, res) => {
    const stats = await getSessionStats();
    res.send(stats);
}));

export default router;
