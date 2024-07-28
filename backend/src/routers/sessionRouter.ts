import {NewSessionDto, Session} from "../models/SessionModel.js";
import {Player} from "../models/PlayerModel.js";
import {nanoid} from "nanoid";
import express from "express";
import {
    kick,
    sessions,
    getSessionInfo,
    mapPersonalPlayerExport,
    setPlayerTimers,
    playerLeave,
    checkIsOwnerByToken,
    checkIsOwnerById, getPlayerById, getSessionByToken, getPlayerByToken, shake, throwEmojiAt
} from "../services/sessionService.js";
import { debug } from "../index.js";
import {io, sendHistogramToSession, sendMessageToSession} from "../services/socketService.js";
import { validateEstimate } from "../services/validationService.js";
import {EstimationHistogram} from "../models/EstimationHistogram";
import {log, logSesstionDetails} from "../services/logger.js";
const router = express.Router();

router.post('/debug', (req, res) => {
    if (debug) {
        console.log(sessions);
    }
    res.send('OK');
});

router.post('/newSession', (req, res) => {
    const newSessionReq: NewSessionDto = req.body;
    const owner: Player = {
        estimate: null,
        name: newSessionReq.leaderName,
        id: nanoid(7),
        token: nanoid(25),
        isOwner: true,
        lastAction: new Date(),
        timeoutIds: [],
    }
    const newSession: Session = {
        open: false,
        token: nanoid(5),
        name: newSessionReq.name,
        players: [owner],
    }
    sessions.push(newSession);
    res.send(newSession);
    setPlayerTimers(newSession.token, owner.token);
    logSesstionDetails(newSession.token, 'new session created');
});
router.post('/joinSession/:token', (req, res) => {
    const token = req.params.token;
    const player: Player = {
        name: req.body.name,
        id: nanoid(7),
        estimate: null,
        token: nanoid(25),
        isOwner: false,
        lastAction: new Date(),
        timeoutIds: [],
    };
    const session = sessions.find((session) => session.token === token);
    if (session) {
        session.players.push(player);
        io.to(token).emit('playerJoined', getSessionInfo(token));
        res.send(player);
        setPlayerTimers(token, player.token);
        sendMessageToSession(token, player.name + ' ist der Sitzung beigetreten.');
        logSesstionDetails(token, player.name + ' joined session ' + token);
    }
    else {
        res.status(404).send('Session not found');
    }
});

router.post('/leaveSession/:token', (req, res) => {
    const token = req.params.token;
    const playerToken = req.body.token;
    const player = getPlayerByToken(playerToken, token);
    try {
        playerLeave(token, playerToken);
        res.send('OK');
        logSesstionDetails(token, player?.name ?? '?' + ' left session ' + token);
    } catch (e: any) {
        res.status(404).send(e.message);
    }
});

// looks up is a session is closed and sends ExportUser oder ExportEstimateUser
router.get('/getSession/:token', (req, res) => {
    const token = req.params.token;
    const session = getSessionInfo(token);
    if (session) {
        res.send(session);
        return;
    }
    else {
        res.status(404).send('Session not found');
    }
});

router.put('/estimate/:token', (req, res) => {
    const token = req.params.token;
    const playerToken = req.body.token;
    const estimate = req.body.estimate;
    if (!validateEstimate(estimate)) {
        res.status(400).send('Estimate not allowed');
        return;
    }

    const session = getSessionByToken(token);
    if (session) {
        const player = getPlayerByToken(playerToken, token);
        if (player) {
            player.estimate = estimate;
            player.lastAction = new Date();
            io.to(token).emit('playerEstimated', getSessionInfo(token));
            res.send('OK');
            setPlayerTimers(token, playerToken);
        }
        else {
            res.status(404).send('Player not found');
        }
    }
    else {
        res.status(404).send('Session not found');
    }
});

router.put('/openSession/:token/:open', (req, res) => {
    const token = req.params.token;
    const userToken = req.body.token;
    const open = req.params.open === 'true';
    const session = getSessionByToken(token);
    const isInSession = session?.players.find((player) => player.token === userToken) !== undefined;
    if (!isInSession) {
        res.status(403).send('Not in session');
        return;
    }
    const isOwner = checkIsOwnerByToken(userToken, session);
    if (!isOwner) {
        res.status(403).send('Not owner');
        return;
    }
    // TODO: put this in a service
    if (session) {
        session.open = open;
        if (!open) {
            session.players.forEach((player) => {
                player.estimate = null;
            });
            sendHistogramToSession(token, {estimationCount: {}});
        }
        else {
            let voters = 0;
            const avg = session.players.reduce((acc, player) => {
                const parse = parseInt(player.estimate ?? '');
                if (isNaN(parse)) {
                    return acc;
                }
                voters++;
                return acc + parse;
            }, 0) / voters;
            const roundedAvg = Math.round(avg);
            const sortedEstimates = session.players
                .map((player) => parseInt(player.estimate ?? ''))
                .filter((estimate) => !isNaN(estimate))
                .sort((a, b) => b - a);
            const median = sortedEstimates[Math.floor(voters / 2)];
            // pick the second highest value
            let secondHighest = sortedEstimates[1];
            if (isNaN(secondHighest))
                secondHighest = sortedEstimates[0];
            const computable = !isNaN(median) && !isNaN(roundedAvg) && !isNaN(secondHighest);
            const estimationHistogram: EstimationHistogram = session.players.reduce((acc: EstimationHistogram, player) => {
                const estimate = parseInt(player.estimate ?? '');
                if (!isNaN(estimate)) {
                    acc.estimationCount[estimate] = (acc.estimationCount[estimate] ?? 0) + 1;
                }
                return acc;
            }, { estimationCount: {}} as EstimationHistogram);
            if (!computable) {
                sendMessageToSession(token, 'Durchschnitt nicht ermittelbar');
                log('Average not computable');
                logSesstionDetails(token, 'Average not computable');
                sendHistogramToSession(token, {estimationCount: {}});
            }
            else {
                sendMessageToSession(token, `Durchschnitt: ${roundedAvg}, Median: ${median}, Vorschlag (zweithöchstes): ${secondHighest}`);
                sendHistogramToSession(token, estimationHistogram);
            }
        }
        io.to(token).emit('sessionOpened', getSessionInfo(token));
        log('Session opened: ' + token + ' - ' + open);
        res.send('OK');
    }
    else {
        res.status(404).send('Session not found');
    }
});

router.get('/isOwner/:token/:sessionToken', (req, res) => {
    const token = req.params.token;
    const sessionToken = req.params.sessionToken;
    const session = getSessionByToken(sessionToken);
    if (session) {
        const player = getPlayerByToken(token, sessionToken);
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
});

router.get('/pullUserInfo/:token/:sessionToken', (req, res) => {
    const token = req.params.token;
    const sessionToken = req.params.sessionToken;
    const session = getSessionByToken(sessionToken);

    if (session) {
        const player = getPlayerByToken(token, sessionToken);
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
});

router.post('/kickPlayer/:id/:sessionToken', (req, res) => {
  const kickId = req.params.id;
  const sessionToken = req.params.sessionToken;
  const playerToken = req.body.userToken;
  const session = getSessionByToken(sessionToken);
  if (session) {
    const player = getPlayerByToken(playerToken, sessionToken);
    const isOwner = checkIsOwnerByToken(playerToken, session);

    if (!isOwner) {
      res.status(403).send('Not owner');
      return;
    }

    const playerToKickIsOwner = checkIsOwnerById(kickId, session);
    if (playerToKickIsOwner) {
      res.status(400).send('You can not kick yourself.');
      return;
    }
      
    if (player) {
      const playerToKick = getPlayerById(kickId, session.token);
      if (playerToKick) {
        kick(playerToKick, sessionToken);
        log('Player kicked: ' + playerToKick.name);
      }
      else {
        res.status(404).send('Player not found');
      }
    }
    else {
      res.status(404).send('Player not found');
    }
  }
  else {
    res.status(404).send('Session not found');
  }
});

router.post('/shake/:id/:sessionToken', (req, res) => {
    const playerToken = req.body.userToken;
    const sessionToken = req.params.sessionToken;
    const shakeId = req.params.id;
    const session = getSessionByToken(sessionToken);
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    const player = getPlayerByToken(playerToken, sessionToken);
    const shakePlayer = getPlayerById(shakeId, sessionToken);
    if (!player) {
        res.status(404).send('Player not found');
        return;
    }
    if (!shakePlayer) {
        res.status(404).send('Player to shake not found');
        return;
    }
    shake(session, shakePlayer);
    res.send('OK');
});

router.post('/throw/:id/:sessionToken', (req, res) => {
    const playerToken = req.body.userToken;
    const emoji = req.body.emoji;
    const sessionToken = req.params.sessionToken;
    const shakeId = req.params.id;
    const session = getSessionByToken(sessionToken);
    if (emoji.length > 7) {
        res.status(400).send('Emoji too long');
        return;
    }
    if (!session) {
        res.status(404).send('Session not found');
        return;
    }
    const player = getPlayerByToken(playerToken, sessionToken);
    const throwPlayer = getPlayerById(shakeId, sessionToken);
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
});

export default router;
