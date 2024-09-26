import sessionRef from "@/reactive/useSession";
import userRef from "@/reactive/useUser";
import axios from "axios";
import env from "@/environments/environments";
import {Subject} from "rxjs";
import type {EstimationOption} from "@/models/Session.model";
import type {ActiveSessions} from "@/models/ActiveSessions";
import {Lit} from "litlyx-js";

export const paperThrowSubject = new Subject<{id: string, emoji: string}>();
export async function estimate(estimate: string) {
    if (!userRef.value) {
        throw new Error('User not initialized');
    }
    if (!sessionRef.value) {
        throw new Error('Session not initialized');
    }
    await axios.put(env.apiServiceRoute + '/estimate/' + sessionRef.value.token, {
        token: userRef.value.token,
        estimate: estimate,
    })
}
export async function pullSessionInfo(sessionToken: string) {
    const res = await axios.get(env.apiServiceRoute + '/getSession/' + sessionToken);
    if (res.status !== 200) {
        localStorage.clear();
        throw new Error('Session not found');
    }
    sessionRef.value = res.data;
}

export async function openSession(open: boolean) {
    if (!userRef.value) {
        throw new Error('User not initialized');
    }
    if (!sessionRef.value) {
        throw new Error('Session not initialized');
    }
    await axios.put(env.apiServiceRoute + '/openSession/' + sessionRef.value.token + '/' + open, {
        token: userRef.value.token,
    })
}

export async function isOwner(sessionToken: string) {
    if (!userRef.value) {
        throw new Error('User not initialized');
    }
    const res = await axios.get(env.apiServiceRoute + '/isOwner/' + userRef.value.token + '/' + sessionToken);
    return res.data;
}

export async function kickPlayer(playerId: string) {
  if (!userRef.value || !sessionRef.value) {
    throw new Error('User or Session not initialized');
  }

  await axios.post(
    env.apiServiceRoute + '/kickPlayer/' + playerId + '/' + sessionRef.value.token,
    {userToken: userRef.value.token},
  );
}

export async function shake(playerId: string): Promise<void> {
    Lit.event("shake");
    if (!userRef.value || !sessionRef.value) {
        throw new Error('User or Session not initialized');
    }

    await axios.post(
        env.apiServiceRoute + '/shake/' + playerId + '/' + sessionRef.value.token,
        {userToken: userRef.value.token},
    );
}

export async function throwEmoji(playerId: string, emoji: string): Promise<void> {
    Lit.event("throw");
    if (!userRef.value || !sessionRef.value) {
        throw new Error('User or Session not initialized');
    }

    await axios.post(
        env.apiServiceRoute + '/throw/' + playerId + '/' + sessionRef.value.token,
        {userToken: userRef.value.token, emoji: emoji},
    );
}

export async function changeEstimationType(estimationType: EstimationOption) {
    Lit.event("change Estimation type");
    if (!userRef.value || !sessionRef.value) {
        throw new Error('User or Session not initialized');
    }

    await axios.put(
        env.apiServiceRoute + '/changeEstimationOptions/' + sessionRef.value.token,
        {userToken: userRef.value.token, estimationType: estimationType},
    );
}

export async function makeOtherPlayerAdmin(playerId: string) {
    if (!userRef.value || !sessionRef.value) {
        throw new Error('User or Session not initialized');
    }

    await axios.put(
        env.apiServiceRoute + `/makeAdmin/${sessionRef.value.token}/${playerId}`,
        {userToken: userRef.value.token},
    );
}

export async function getActiveSessions() {
    const res = await axios.get(env.apiServiceRoute + '/currentActiveSessions');
    return res.data as ActiveSessions;
}
