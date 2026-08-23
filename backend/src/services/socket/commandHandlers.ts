import {gatherContextInformation, sendMessageToAi} from "../ai/ai-service.js";
import {sendAiCommandResponse, sendMessageStrFromServer} from "./socketSendService.js";


export async function handleAsk(command: string, socketId: string) {
    const contextInformation = await gatherContextInformation(socketId);
    if (!contextInformation) {
        return;
    }
    sendAiCommandResponse(socketId, "evaluating ...");
    sendMessageToAi(command, contextInformation, "ask").then(res => {
        sendAiCommandResponse(socketId, res);
    });
}

export async function handleEstimation(command: string, socketId: string) {
    const contextInformation = await gatherContextInformation(socketId);
    if (!contextInformation) {
        return;
    }
    sendAiCommandResponse(socketId, "estimating ...");
    sendMessageToAi(command, contextInformation, "estimation").then(res => {
        sendAiCommandResponse(socketId, res);
    });
}
