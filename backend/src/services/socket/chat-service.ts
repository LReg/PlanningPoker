import {getPlayerTokenFromSocketId} from "./socketDataService.js";
import {getSessionTokenByPlayerToken, setPlayerTimers} from "../sessionService.js";
import {log} from "../logger.js";
import {Message} from "../../models/Message.model";
import {sendMessageStrFromServer, sendMessage, sendAiCommandResponse} from "./socketSendService.js";
import {handleAsk, handleEstimation} from "./commandHandlers.js";

export function handleNewChatMessage(socketId: string, message: Message) {
    if (message.message.charAt(0) === '/') {
        handleCommand(message.message.slice(1), socketId);
        return;
    }
    const playerToken = getPlayerTokenFromSocketId(socketId);
    if (!playerToken) {
        return;
    }
    const sessionToken = getSessionTokenByPlayerToken(playerToken);
    if (!sessionToken) {
        return;
    }
    sendMessage(message, sessionToken)
    setPlayerTimers(sessionToken, playerToken);
    log('chat: ' +  message.name + ' -> ' + message.message + ' in ' + sessionToken);
}

const commands: { [key: string]: (command: string, socketId: string) => void } = {
    "ask": handleAsk,
    "estimation": handleEstimation,
}

function handleCommand(command: string, socketId: string) {
    const commandStrArr = command.split(' ');
    if (commandStrArr === undefined || commandStrArr.length === 0) {
        handleCommandError(socketId, "could not parse command");
        return;
    }
    const commandKey = Object.keys(commands).find(key => key === commandStrArr[0].toLowerCase())
    if (commandKey === undefined) {
        handleCommandError(socketId, "could not find command")
        return
    }
    const commandFn = commands[commandKey];
    sendAiCommandResponse(socketId, "/" + command)
    commandFn(command, socketId);
}

function handleCommandError(socketId: string, error: string) {
    const playerToken = getPlayerTokenFromSocketId(socketId);
    if (playerToken) {
        sendAiCommandResponse(playerToken, error)
    }
}