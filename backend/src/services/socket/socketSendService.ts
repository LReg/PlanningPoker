import {io} from "./socketService.js";
import {EstimationHistogram} from "../../models/EstimationHistogram.js";
import {Message} from "../../models/Message.model";
import sanitizeHtml from 'sanitize-html';

export function sendMessage(message: Message, anyToken: string) {
    message.message = sanitize(message.message);
    io.to(anyToken).emit('newMessage', message);
}

export function sendMessageStrFromServer(anyToken: string, message: string) {
    message = sanitize(message);
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

function sanitize(dirty: string): string {
    return sanitizeHtml(dirty, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
    });
}
