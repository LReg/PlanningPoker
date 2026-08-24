<script setup lang="ts">
import sessionRef from "@/reactive/useSession";
import userRef from "@/reactive/useUser";
import ColorThemeChooser from "@/components/ColorThemeChooser.vue";
import {CopyOutlined, EyeInvisibleOutlined, EyeOutlined, LogoutOutlined, UserOutlined, UserSwitchOutlined} from "@ant-design/icons-vue";
import env from "@/environments/environments";
import {message} from "ant-design-vue";
import {exitSpectateGame, getSpectatorAsUser, leaveGame} from "@/api/joinLeaveService";
import {openSession} from "@/api/actionsService";
import {useRoute, useRouter} from "vue-router";
import {noop} from "rxjs";
import {ref, watch} from "vue";
import EstimationOptionsChooser from "@/components/EstimationOptionsChooser.vue";

const router = useRouter();
const route = useRoute();
const gameToken: string = (typeof route.params.token === 'object' ? route.params.token[0] : route.params.token);

const handleLeave = () => {
  if (!userRef.value)
    return;
  leaveGame(gameToken, userRef.value.token).then(() => {
    router.push('/');
  });
}
const handleCopy = () => {
  navigator.clipboard.writeText(env.joinAddress + gameToken).then(() => {
    message.success('Beitrittslink wurde in die Zwischenablage kopiert.');
  });
}
const handleLeaveSpectatorMode = () => {
  exitSpectateGame().then(() => {
    router.push('/');
  });
}
const handleSpectateFromPlayer = () => {
  getSpectatorAsUser().then(() => message.success('Du bist nun Zuschauer.'));
}

const toggleOpen = async () => {
  if (!sessionRef.value)
    return;
  await openSession(!sessionRef.value.open);
}

const handleJoinGame = () => {
  router.push('/join/' + gameToken);
}
</script>

<template>
  <div class="top-bar">
    <div class="top-bar_container top-bar_left">
      <h1 v-if="sessionRef" class="session-title">
        {{ sessionRef.name }}
      </h1>
      <span class="token-pill">
        <button class="icon-btn" @click="handleCopy" title="Token kopieren">
          <CopyOutlined />
        </button>
        {{gameToken}}
      </span>
      <a-button class="reveal-btn" @click="toggleOpen()" v-if="userRef && userRef.isOwner && sessionRef && sessionRef.open === true">
        <template #icon>
          <EyeInvisibleOutlined></EyeInvisibleOutlined>
        </template>
        neue Schätzung
      </a-button>
      <a-button class="reveal-btn" @click="toggleOpen()" v-if="userRef && userRef.isOwner && sessionRef && sessionRef.open === false">
        <template #icon>
          <EyeOutlined></EyeOutlined>
        </template>
        Schätzungen aufdecken
      </a-button>
    </div>
    <div v-if="userRef" class="top-bar_container top-bar_usercontainer">
      <EstimationOptionsChooser v-if="userRef && userRef.isOwner"></EstimationOptionsChooser>
      <ColorThemeChooser></ColorThemeChooser>
      <span class="user-chip">
        <UserOutlined/>
        {{userRef.name}}
      </span>
      <a-button v-if="userRef && !userRef.isOwner" @click="handleSpectateFromPlayer" ghost>
        Zuschauer werden
        <template #icon>
          <UserSwitchOutlined />
        </template>
      </a-button>
      <a-button ghost @click="handleLeave()">
        Verlassen
        <template #icon><LogoutOutlined /></template>
      </a-button>
      <app-launcher current="planning-poker" theme="light"></app-launcher>
    </div>
    <div v-if="!userRef" class="top-bar_container top-bar_usercontainer">
      <ColorThemeChooser></ColorThemeChooser>
      <span class="user-chip">
        <UserOutlined/>
        Zuschauer
      </span>
      <a-button ghost @click="handleJoinGame">
        Spiel beitreten
        <template #icon>
          <UserSwitchOutlined />
        </template>
      </a-button>
      <a-button ghost @click="handleLeaveSpectatorMode()">
        <template #icon><LogoutOutlined /></template>
      </a-button>
      <app-launcher current="planning-poker" theme="light"></app-launcher>
    </div>
  </div>
</template>

<style scoped>

h1 {
  margin: 0;
  font-size: 1.3em;
}

.session-title {
  font-weight: 800;
}

.top-bar_usercontainer {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: .7rem;
}

.top-bar {
  flex-wrap: wrap;
  width: 100%;
  margin: 0 auto;
  background-image: linear-gradient(105deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  position: sticky;
  top: 0;
  z-index: 200;
}
.top-bar_container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .8rem;
}
.top-bar_left {
  min-width: 0;
}

.token-pill, .user-chip {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  padding: .4rem .9rem;
  border-radius: 999px;
  font-size: .9em;
  font-weight: 500;
  backdrop-filter: blur(6px);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  color: white;
  cursor: pointer;
  transition: background .2s ease;
}
.icon-btn:hover {
  background: rgba(255, 255, 255, 0.38);
}

.reveal-btn {
  border-radius: 999px;
}

:deep(.top-bar .ant-btn),
:deep(.top-bar .ant-btn.ant-btn-background-ghost) {
  border-radius: 999px;
  border-color: rgba(255, 255, 255, 0.5) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  text-shadow: none;
}
:deep(.top-bar .ant-btn:hover),
:deep(.top-bar .ant-btn.ant-btn-background-ghost:hover) {
  border-color: white !important;
  color: white !important;
  background: rgba(255, 255, 255, 0.22) !important;
}

@media(max-width: 1295px) {
  .top-bar {
    justify-content: flex-start;
  }
  .top-bar_usercontainer {
    justify-content: start;
  }
}
</style>