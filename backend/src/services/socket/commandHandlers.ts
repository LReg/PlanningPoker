import {gatherContextInformation, sendMessageToAi} from "../ai/ai-service.js";
import {sendMessageStrFromServer} from "./socketSendService.js";


export function handleAsk(command: string, socketId: string) {
    const contextInformation = gatherContextInformation(socketId);
    if (!contextInformation) {
        return;
    }
    sendMessageStrFromServer(socketId, "evaluating ...");
    sendMessageToAi(command, contextInformation, "ask").then(res => {
        sendMessageStrFromServer(socketId, res);
    });
}

export function handleEstimation(command: string, socketId: string) {
    const contextInformation = gatherContextInformation(socketId);
    if (!contextInformation) {
        return;
    }
    sendMessageStrFromServer(socketId, "estimating ...");
    sendMessageToAi(command, contextInformation, "estimation").then(res => {
        sendMessageStrFromServer(socketId, res);
    });
}
