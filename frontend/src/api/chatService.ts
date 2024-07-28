import type { Ref } from 'vue';
import { socket } from "./socketService";
import { ref } from "vue";
import type {Message} from "@/models/Message.model";
import userRef from "@/reactive/useUser";
import sessionRef from "@/reactive/useSession";
export const messagesRef: Ref<Message[]> = ref([]);

export async function postMessage(message: string) {
    if (!socket) {
        throw new Error('Socket not initialized');
    }
    if (!sessionRef.value) {
        throw new Error('Session not joined');
    }
    const messageObj: Message = {
        name: userRef?.value?.name ?? 'Zuschauer',
        message: message,
        timestamp: Date.now(),
    }
    messagesRef.value.push(messageObj);
    socket.emit('chat', messageObj, sessionRef.value.token);
}

export function clearMessages() {
    messagesRef.value = [];
}