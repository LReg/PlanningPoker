import type { Ref } from 'vue';
import { socket } from "./socketService";
import { ref } from "vue";
import type {Message} from "@/models/Message.model";
import userRef from "@/reactive/useUser";
import sessionRef from "@/reactive/useSession";
import {Lit} from "litlyx-js";
export const messagesRef: Ref<Message[]> = ref([]);
export const aimessageRef: Ref<Message[]> = ref([]);

export async function postMessage(message: string, type: 'std' | 'ai') {
    if (!socket) {
        throw new Error('Socket not initialized');
    }
    if (!sessionRef.value) {
        throw new Error('Session not joined');
    }

    message = commandTransformations(message)

    const messageObj: Message = {
        name: userRef?.value?.name ?? 'Zuschauer',
        message: message,
        timestamp: Date.now(),
        type: type
    }
    socket.emit('chat', messageObj);
    if (message.startsWith('/')) {
        await Lit.event("command", {
            metadata: {
                prompt: messageObj.message
            }
        });
    }
}

function commandTransformations(message: string) {
   if (message.startsWith('/img ')) {
       const url = message.split(' ').at(1);
       if (url === undefined) {
           return message;
       }
       return `<img style="max-height: 200px" src="${url}" />`;
   }
   return message;
}

export function clearMessages() {
    messagesRef.value = [];
}