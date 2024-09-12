import {Session} from "./SessionModel";
import {sendHistogramToSession, sendMessageToSession} from "../services/socketService.js";
import {log, logSesstionDetails} from "../services/logger.js";

export interface EstimationHistogram {
    estimationCount: {[key: number]: number};
}

function getAvg(session: Session, voters: number) {
    return session.players.reduce((acc, player) => {
        const parse = parseInt(player.estimate ?? '');
        if (isNaN(parse)) {
            return acc;
        }
        return acc + parse;
    }, 0) / voters;
}

function getNrOfVoters(session: Session) {
    return session.players.reduce((acc, player) => {
        const parse = parseInt(player.estimate ?? '');
        if (isNaN(parse)) {
            return acc;
        }
        return acc + 1;
    }, 0);
}

function getSortedEstimates(session: Session) {
    return session.players
        .map((player) => parseInt(player.estimate ?? ''))
        .filter((estimate) => !isNaN(estimate))
        .sort((a, b) => b - a);
}

function getEstimationHistogram(session: Session) {
    return session.players.reduce((acc: EstimationHistogram, player) => {
        const estimate = parseInt(player.estimate ?? '');
        if (!isNaN(estimate)) {
            acc.estimationCount[estimate] = (acc.estimationCount[estimate] ?? 0) + 1;
        }
        return acc;
    }, {estimationCount: {}} as EstimationHistogram);
}

function handleNotComputable(token: string, session: Session) {
    sendMessageToSession(token, 'Durchschnitt nicht ermittelbar');
    log('Average not computable');
    log(session.players.map((player) => player.estimate ?? 'X').toString());
    logSesstionDetails(token, 'Average not computable');
    sendHistogramToSession(token, {estimationCount: {}});
}

export function createAndSendHistogram(session: Session, token: string) {
    let voters = getNrOfVoters(session);
    const avg = getAvg(session, voters);
    const roundedAvg = Math.round(avg);
    const sortedEstimates = getSortedEstimates(session);
    const median = sortedEstimates[Math.floor(voters / 2)];
    // pick the second highest value
    let secondHighest = sortedEstimates[1];
    if (isNaN(secondHighest))
        secondHighest = sortedEstimates[0];
    const computable = !isNaN(median) && !isNaN(roundedAvg) && !isNaN(secondHighest);
    const estimationHistogram: EstimationHistogram = getEstimationHistogram(session);
    if (!computable) {
        handleNotComputable(token, session);
    } else {
        sendMessageToSession(token, `Durchschnitt: ${roundedAvg}, Median: ${median}, Vorschlag (zweithöchstes): ${secondHighest}`);
        sendHistogramToSession(token, estimationHistogram);
    }
}
