import {sendMessageToAi} from "../ai/ai-service.js";
import {sendMessageStrFromServer} from "./socketSendService.js";
import {getPlayerTokenFromSocketId} from "./socketDataService.js";
import {getSessionTokenByPlayerToken} from "../sessionService.js";

export function handleAsk(command: string, socketId: string) {
    const userToken = getPlayerTokenFromSocketId(socketId);
    if (!userToken) {
        sendMessageStrFromServer(socketId, "error");
        return;
    }
    const sessionToken = getSessionTokenByPlayerToken(userToken);
    if (!userToken || !sessionToken) {
        sendMessageStrFromServer(socketId, "error");
        return;
    }
    sendMessageStrFromServer(socketId, "asking AI");
    sendMessageToAi(command, socketId, sessionToken, userToken).then(res => {
        sendMessageStrFromServer(socketId, res);
    });
}
