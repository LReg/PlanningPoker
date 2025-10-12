import {EstimationOption, Session} from "./SessionModel.js";
import {log, logSesstionDetails} from "../services/logger.js";
import {
    sendHistogramToSession,
    sendMessageStrFromServer
} from "../services/socket/socketSendService.js";

export interface EstimationHistogram {
    estimationCount: {[key: string]: number};
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
        const estimate = player.estimate ?? '';
        if (estimate !== '')
            acc.estimationCount[estimate] = (acc.estimationCount[estimate] ?? 0) + 1;
        return acc;
    }, {estimationCount: {}} as EstimationHistogram);
}

function handleNotComputable(token: string, session: Session) {
    sendMessageStrFromServer(token, 'Durchschnitt nicht ermittelbar');
    logSesstionDetails(token, 'Average not computable');
    log('The estimations are: ' + session.players.map((player) => player.estimate ?? 'X').toString());
}

export function createAndSendHistogram(session: Session, token: string) {
    handleMessage(session, token);
    handleHistogram(session, token);
}

function handleHistogram(session: Session, token: string) {
    const estimationHistogram: EstimationHistogram = getEstimationHistogram(session);
    sendHistogramToSession(token, estimationHistogram);
}

function handleMessage(session: Session, token: string) {

    if (session.estimationOptions === EstimationOption.TShirtSizes)
        return;

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

    if (!computable) {
        handleNotComputable(token, session);
        return;
    }

    sendMessageStrFromServer(token, `Durchschnitt: ${roundedAvg}, Median: ${median}, Vorschlag (zweithöchstes): ${secondHighest}`);
}
