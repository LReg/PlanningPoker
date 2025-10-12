import {io} from "./socketService.js";
import {EstimationHistogram} from "../../models/EstimationHistogram.js";
import {Message} from "../../models/Message.model";

export function sendMessage(message: Message, anyToken: string) {
    io.to(anyToken).emit('newMessage', message);
}

export function sendMessageStrFromServer(anyToken: string, message: string) {
    const messageObj = {
        message: message,
        name: 'Server',
        timestamp: new Date().getTime()
    }
    io.to(anyToken).emit('newMessage', messageObj);
}

export function sendHistogramToSession(sessionToken: string, histogram: EstimationHistogram) {
    io.to(sessionToken).emit('newHistogram', histogram);
}
