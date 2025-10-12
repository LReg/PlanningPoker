import axios from "axios";
import {sendMessageStrFromServer} from "../socket/socketSendService.js";
import {getPlayerTokenFromSocketId} from "../socket/socketDataService.js";
import {getSessionByToken, getSessionTokenByPlayerToken} from "../sessionService.js";
import {EstimationOption, FibonacciEstimationValues} from "../../models/SessionModel.js";


interface SessionInformation {
    estimationOptions: EstimationOption;
    estimationValues: string[];
}
interface ContextInformation {
    sessionToken: string;
    userToken: string;
    socketId: string;
    sessionInformation: SessionInformation;
}

export function gatherContextInformation(socketId: string): ContextInformation | null {
    const userToken = getPlayerTokenFromSocketId(socketId);
    if (!userToken) {
        sendMessageStrFromServer(socketId, "error");
        return null;
    }
    const sessionToken = getSessionTokenByPlayerToken(userToken);
    if (!sessionToken) {
        sendMessageStrFromServer(socketId, "error");
        return null;
    }
    const session = getSessionByToken(sessionToken);

    const sessionInformation: SessionInformation = {
        estimationOptions: session?.estimationOptions ?? EstimationOption.Fibonacci,
        estimationValues: session?.estimationValues ?? FibonacciEstimationValues,
    }

    return {
        sessionToken,
        userToken,
        sessionInformation,
        socketId
    } as ContextInformation;
}
export async function sendMessageToAi(message: string, context: ContextInformation, command: string): Promise<string> {
    let data = JSON.stringify({
        action: "sendMessage",
        sessionId: context.socketId,
        chatInput: message,
        sessionToken: context.sessionToken,
        userToken: context.userToken,
        command: command,
        sessionInformation: context.sessionInformation,
        backendBaseurl: `${process.env.PROTOCOL}://${process.env.DOMAIN}/api`,
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.N8NCHAT,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',
            'Accept': '*/*',
            'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Content-Type': 'application/json',
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        return response.data.output;
    } catch (error) {
        console.log(error);
        return "error";
    }

}