<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {tryReconnectFromBrowserStorage, spectateGame} from "@/api/joinLeaveService";
import userRef from "@/reactive/useUser";
import sessionRef from "@/reactive/useSession";
import User from "@/components/User.vue";
import EstimateOptions from "@/components/EstimateOptions.vue";
import {computed, ref, watch} from "vue";
import { message } from 'ant-design-vue';
import Chat from "@/components/Chat.vue";
import {clearMessages} from "@/api/chatService";
import estimationHistogram from "@/reactive/useEstimationHistogram";
import Histogram from "@/components/Histogram.vue";
import TopBar from "@/components/TopBar.vue";
import {socketExit} from "@/api/socketService";
import chatCollapsedRef from "@/reactive/useChatCollapsed";
import playerViewModeRef from "@/reactive/usePlayerViewMode";

const router = useRouter();
const route = useRoute();
const gameToken: string = (typeof route.params.token === 'object' ? route.params.token[0] : route.params.token);
const estimateOptionsRef = ref(null);

const estimationOptions = computed(() => {
  return sessionRef.value?.estimationValues;
})

if (sessionRef.value === null) {
  if (!localStorage.getItem('userToken')) {
    // kein Usertoken vorhanden -> Zuschauermodus
    spectateGame(gameToken).then(
      () => {
        message.success('Du bist nun Zuschauer.');
      }
    ).catch(() => {
      socketExit();
      clearMessages();
      localStorage.clear();
      router.push('/');
      message.error('Die Sitzung ist abgelaufen, du musst eine neue erstellen.');
    });
  }
  else {
    // Usertoken vorhanden -> versuche Wiederverbindung
    tryReconnectFromBrowserStorage(gameToken)
        .then(
            () => {
              message.success('Du bist nun wieder in der Sitzung.');
            }
        )
        .catch(() => {
          socketExit();
          clearMessages();
          localStorage.clear();
          router.push('/');
          message.error('Die Sitzung ist abgelaufen, du musst eine neue erstellen.');
    });
  }
}

watch(sessionRef, (newValue, oldValue) => {
  if (newValue?.open === false && oldValue?.open === true)
    // @ts-ignore
    estimateOptionsRef?.value?.resetSelection();
  if (newValue?.estimationOptions !== oldValue?.estimationOptions)
    // @ts-ignore
    estimateOptionsRef?.value?.resetSelection();
});


</script>
<template>
  <div class="game-shell">
    <TopBar></TopBar>
    <div class="content_container">
      <div v-if="sessionRef" class="userContainer" :class="{'userContainer--list': playerViewModeRef === 'list', 'userContainer--full': chatCollapsedRef}">
        <User v-for="user of sessionRef.players" :id="user.id" :estimate="user.estimate" :username="user.name" :list-view="playerViewModeRef === 'list'"></User>
      </div>
      <div class="chat_container" :class="{'chat_container--collapsed': chatCollapsedRef}">
        <Chat></Chat>
      </div>
    </div>
  </div>
  <Histogram v-if="sessionRef && estimationHistogram" :data="estimationHistogram" :hide="!sessionRef?.open"></Histogram>
  <EstimateOptions v-if="sessionRef && userRef" ref="estimateOptionsRef" :estimation-options="estimationOptions" :hide="sessionRef?.open" class="estimations"></EstimateOptions>
</template>

<style scoped>
.game-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.userContainer{
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
  gap: 1rem;
  width: 70%;
  min-width: 17rem;
  padding: 1.5rem 1rem;
  overflow-y: auto;
  transition: width .25s ease;
}
.userContainer--full {
  width: 100%;
}
.userContainer--list {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 1.3em;
}
.content_container {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 1rem;
  width: 100%;
  padding-bottom: 10rem;
  overflow-x: auto;
}
.chat_container {
  min-width: 17rem;
  min-height: 0;
  padding: 1rem 1rem 1rem 1.25rem;
  width: 30%;
  border-left: 1px solid var(--surface-border);
  transition: width .25s ease, min-width .25s ease, opacity .2s ease, padding .25s ease;
}
.chat_container--collapsed {
  width: 0;
  min-width: 0;
  padding: 0;
  border-left: none;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
