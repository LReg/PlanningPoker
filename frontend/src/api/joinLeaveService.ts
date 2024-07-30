import axios from 'axios';
import type {ExportEstimateSession} from "@/models/Session.model";
import env from "@/environments/environments";
import sessionRef from "@/reactive/useSession";
import userRef from "@/reactive/useUser";
import {paperThrowSubject, pullSessionInfo} from "@/api/actionsService";
import { message } from 'ant-design-vue';
import { socket, socketConnect, socketExit } from "./socketService";
import {clearMessages, messagesRef} from "@/api/chatService";
import type {Message} from "@/models/Message.model";
import type {EstimationHistogram} from "@/models/EstimationHistogram";
import useEstimationHistogram from "@/reactive/useEstimationHistogram";
const histogramRef = useEstimationHistogram;

function socketSessionUpdateListeners() {
    socket!.on('playerJoined', (session: ExportEstimateSession) => {
        sessionRef.value = session;
        message.info('Ein Spieler ist der Sitzung beigetreten.');
    });
    socket!.on('playerLeft', (session: ExportEstimateSession) => {
        sessionRef.value = session;
        message.info('Ein Spieler hat die Sitzung verlassen.');
    });
    socket!.on('playerEstimated', (session: ExportEstimateSession) => {
        if (session.open) {
            histogramRef.value = { estimationCount: {}};
        }
        sessionRef.value = session;
    });
    socket!.on('sessionOpened', (session: ExportEstimateSession) => {
        sessionRef.value = session;
    });
    socket!.on('playerKicked', (session: ExportEstimateSession) => {
        sessionRef.value = session;
        message.info('Ein Spieler wurde aus der Sitzung entfernt.');
    });
    socket!.on('newHistogram', (histogram: EstimationHistogram) => {
        histogramRef.value = histogram;
    })
    socket?.on('newMessage', (message: Message) => {
        messagesRef.value.push(message);
    });
    socket?.on('throw', (playerId: string, emoji: string) => {
        paperThrowSubject.next({id: playerId, emoji});
    });
}

function socketSessionListenersForPlayers() {
    socket!.on('updateUserinfo', () => {
        if (!sessionRef.value || !userRef.value) {
            throw new Error('Session or User not initialized');
        }
        pullUserInfo(sessionRef.value.token, userRef.value?.token);
    })
    socket!.on('kicked', () => {
        localStorage.clear();
        userRef.value = null;
        socketExit();
        window.location.reload();
    });
    socket!.on('shake', () => {
        document.body.classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('shake');
        }, 1000);
    });
    socket!.on('kickWarning', () => {
        message.warning('Du wirst in 5 Minuten aus der Sitzung geworfen, wenn du nicht aktiv bleibst');
    });
}

export async function createGame(sessionName: string, leaderName: string): Promise<string> {
    if (socket) {
        throw new Error('Socket already initialized');
    }
    const res = await axios.post(env.apiServiceRoute + '/newSession', {
        name: sessionName,
        leaderName: leaderName,
    })
    socketConnect();
    // @ts-ignore
    socket?.emit('joinSession', res.data.token, res.data.players[0].token);
    socketSessionUpdateListeners();
    socketSessionListenersForPlayers();
    userRef.value = res.data.players[0];
    sessionRef.value = res.data;
    localStorage.setItem('userToken', res.data.players[0].token);
    localStorage.setItem('sessionToken', res.data.token);
    return res.data.token;
}

export async function joinGame(sessionToken: string, playerName: string): Promise<void> {
    if (socket) {
        socketExit();
    }
    localStorage.clear();
    userRef.value = null;
    const res = await axios.post(env.apiServiceRoute + '/joinSession/' + sessionToken, {
        name: playerName,
    })
    if (res.status === 404) {
        message.error('Beitreten fehlgeschlagen, überprüfe den Token.');
    }
    socketConnect();
    // @ts-ignore
    socket?.emit('joinSession', sessionToken, res.data.token);
    socketSessionUpdateListeners();
    socketSessionListenersForPlayers();
    clearMessages();
    await pullSessionInfo(sessionToken);
    localStorage.setItem('userToken', res.data.token);
    localStorage.setItem('sessionToken', sessionToken);
    userRef.value = res.data;
}

export async function pullUserInfo(sessionToken: string, playerToken: string): Promise<void> {
    const res = await axios.get(env.apiServiceRoute + '/pullUserInfo/' + playerToken + '/' + sessionToken);
    if (
        res.status !== 200
    ) {
        throw new Error('Could not pull user info');
    }
    userRef.value = res.data;
}

export async function tryReconnectFromBrowserStorage(sessionToken: string) {
    if (socket) {
        throw new Error('Socket already initialized');
    }
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
        return;
    }
    await pullUserInfo(sessionToken, userToken);
    clearMessages();
    socketConnect();
    // @ts-ignore
    socket?.emit('joinSession', sessionToken, userToken);
    socketSessionUpdateListeners();
    socketSessionListenersForPlayers();
    await pullSessionInfo(sessionToken);
}

export async function leaveGame(sessionToken: string, playerToken: string): Promise<void> {
    if (!socket) {
        throw new Error('Socket not initialized');
    }
    await axios.post(env.apiServiceRoute + '/leaveSession/' + sessionToken, {
        token: playerToken,
    });
    clearMessages();
    socketExit();
    userRef.value = null;
    localStorage.clear();
}

export async function spectateGame(sessionToken: string): Promise<void> {
    if (socket) {
        throw new Error('Socket already initialized');
    }
    socketConnect();
    // @ts-ignore
    socket?.emit('joinSession', sessionToken);
    socketSessionUpdateListeners();
    await pullSessionInfo(sessionToken);
}

export async function exitSpectateGame(): Promise<void> {
    socketExit();
    clearMessages();
    localStorage.clear();
    userRef.value = null;
}

export async function getSpectatorAsUser(): Promise<void> {
    if (!socket) {
        throw new Error('Socket not initialized');
    }
    const sessionToken = localStorage.getItem('sessionToken');
    const playerToken = localStorage.getItem('userToken');
    if (!sessionToken || !playerToken) {
        throw new Error('No session or player token found');
    }
    await axios.post(env.apiServiceRoute + '/leaveSession/' + sessionToken, {
        token: playerToken,
    });
    userRef.value = null;
    socketExit();
    localStorage.clear();
    await spectateGame(sessionToken);
}



