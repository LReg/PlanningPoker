import {sendMessageToAi} from "../ai/ai-service.js";
import {sendMessageStrFromServer} from "./socketSendService.js";

export function handleAsk(command: string, socketId: string) {
    sendMessageStrFromServer(socketId, "asking AI");
    sendMessageToAi(command, socketId).then(res => {
        sendMessageStrFromServer(socketId, res);
    });
}
