import {getPlayerTokenFromSocketId} from "./socketDataService.js";
import {getSessionTokenByPlayerToken, touchPlayerActivity} from "../sessionService.js";
import {log} from "../logger.js";
import {Message} from "../../models/Message.model";
import {sendMessageStrFromServer, sendMessage, sendAiCommandResponse} from "./socketSendService.js";
import {handleAsk, handleEstimation} from "./commandHandlers.js";

export async function handleNewChatMessage(socketId: string, message: Message) {
    if (message.message.charAt(0) === '/') {
        void handleCommand(message.message.slice(1), socketId);
        return;
    }
    const playerToken = await getPlayerTokenFromSocketId(socketId);
    if (!playerToken) {
        return;
    }
    const sessionToken = await getSessionTokenByPlayerToken(playerToken);
    if (!sessionToken) {
        return;
    }
    sendMessage(message, sessionToken)
    void touchPlayerActivity(sessionToken, playerToken);
    log('chat: ' +  message.name + ' -> ' + message.message + ' in ' + sessionToken);
}

const commands: { [key: string]: (command: string, socketId: string) => void } = {
    "ask": handleAsk,
    "estimation": handleEstimation,
}

async function handleCommand(command: string, socketId: string) {
    const commandStrArr = command.split(' ');
    if (commandStrArr === undefined || commandStrArr.length === 0) {
        await handleCommandError(socketId, "could not parse command");
        return;
    }
    const commandKey = Object.keys(commands).find(key => key === commandStrArr[0].toLowerCase())
    if (commandKey === undefined) {
        await handleCommandError(socketId, "could not find command")
        return
    }
    const commandFn = commands[commandKey];
    sendAiCommandResponse(socketId, "/" + command)
    commandFn(command, socketId);
}

async function handleCommandError(socketId: string, error: string) {
    const playerToken = await getPlayerTokenFromSocketId(socketId);
    if (playerToken) {
        sendAiCommandResponse(playerToken, error)
    }
}