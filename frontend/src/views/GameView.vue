<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {tryReconnectFromBrowserStorage, spectateGame} from "@/api/joinLeaveService";
import userRef from "@/reactive/useUser";
import sessionRef from "@/reactive/useSession";
import User from "@/components/User.vue";
import EstimateOptions from "@/components/EstimateOptions.vue";
import {computed, ref, watch} from "vue";
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import Chat from "@/components/Chat.vue";
import {clearMessages} from "@/api/chatService";
import estimationHistogram from "@/reactive/useEstimationHistogram";
import Histogram from "@/components/Histogram.vue";
import TopBar from "@/components/TopBar.vue";
import PlayerViewSwitch from "@/components/PlayerViewSwitch.vue";
import {socketExit} from "@/api/socketService";
import chatCollapsedRef from "@/reactive/useChatCollapsed";
import playerViewModeRef from "@/reactive/usePlayerViewMode";
import { LeftOutlined, RightOutlined } from "@ant-design/icons-vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const gameToken: string = (typeof route.params.token === 'object' ? route.params.token[0] : route.params.token);
const estimateOptionsRef = ref(null);

const estimationOptions = computed(() => {
  return sessionRef.value?.estimationValues;
})

const toggleChatCollapsed = () => {
  chatCollapsedRef.value = !chatCollapsedRef.value;
}

if (sessionRef.value === null) {
  if (!localStorage.getItem('userToken')) {
    // kein Usertoken vorhanden -> Zuschauermodus
    spectateGame(gameToken).then(
      () => {
        message.success(t('toast.becameSpectator'));
      }
    ).catch(() => {
      socketExit();
      clearMessages();
      localStorage.clear();
      router.push('/');
      message.error(t('toast.sessionExpired'));
    });
  }
  else {
    // Usertoken vorhanden -> versuche Wiederverbindung
    tryReconnectFromBrowserStorage(gameToken)
        .then(
            () => {
              message.success(t('toast.reconnected'));
            }
        )
        .catch(() => {
          socketExit();
          clearMessages();
          localStorage.clear();
          router.push('/');
          message.error(t('toast.sessionExpired'));
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
      <PlayerViewSwitch class="player-view-switch"></PlayerViewSwitch>
      <div class="panels">
        <div v-if="sessionRef" class="userContainer" :class="{'userContainer--list': playerViewModeRef === 'list', 'userContainer--full': chatCollapsedRef}">
          <User v-for="user of sessionRef.players" :id="user.id" :estimate="user.estimate" :username="user.name" :list-view="playerViewModeRef === 'list'"></User>
        </div>
        <button
            class="chat-handle"
            :class="{'chat-handle--collapsed': chatCollapsedRef}"
            :title="chatCollapsedRef ? t('chatToggle.show') : t('chatToggle.hide')"
            :aria-label="chatCollapsedRef ? t('chatToggle.show') : t('chatToggle.hide')"
            @click="toggleChatCollapsed"
        >
          <LeftOutlined v-if="!chatCollapsedRef"/>
          <RightOutlined v-else/>
        </button>
        <div class="chat_container" :class="{'chat_container--collapsed': chatCollapsedRef}">
          <Chat></Chat>
        </div>
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
  padding: 3.4rem 1rem 1.5rem;
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
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  padding-bottom: 10rem;
  overflow-x: auto;
}
.player-view-switch {
  position: absolute;
  top: .8rem;
  left: .8rem;
  z-index: 210;
}
/* Excludes content_container's own padding-bottom (reserved for the floating histogram/
   estimate bar) so the chat handle's top:50% below centers on the actually-visible player+
   chat row, not on that reserved space too. */
.panels {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 1rem;
  width: 100%;
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
.chat-handle {
  position: absolute;
  top: 50%;
  /* Centered exactly on the chat_container/userContainer seam: right:30% is that seam's
     position, offset by half the handle's own width so its center — not its edge — lands
     on it. Only the vertical centering (translateY) is a transform; the horizontal position
     is plain right/calc per state, so collapsing never pushes it past the panel edge. */
  right: calc(30% - .55rem);
  transform: translateY(-50%);
  z-index: 211;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 3.6rem;
  padding: 0;
  font-size: .65rem;
  border: 1px solid var(--surface-border);
  border-radius: 999px;
  background: var(--theme-container-color);
  color: var(--text-color-secondary);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: right .25s ease, background .2s ease, color .2s ease, transform .15s ease;
}
.chat-handle:hover {
  background-image: linear-gradient(105deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  border-color: transparent;
  color: #ffffff;
  transform: translateY(-50%) scale(1.08);
}
.chat-handle--collapsed {
  right: .6rem;
}
</style>
