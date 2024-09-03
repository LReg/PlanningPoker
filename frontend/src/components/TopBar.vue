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
  navigator.clipboard.writeText(env.joinAdress + gameToken).then(() => {
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
    <div style="gap: 1rem;" class="top-bar_container">
      <h1 v-if="sessionRef">
        {{ sessionRef.name }}
      </h1>
      <a-button @click="toggleOpen()" v-if="userRef && userRef.isOwner && sessionRef && sessionRef.open === true">
        <template #icon>
          <EyeInvisibleOutlined></EyeInvisibleOutlined>
        </template>
        neue Schätzung
      </a-button>
      <a-button @click="toggleOpen()" v-if="userRef && userRef.isOwner && sessionRef && sessionRef.open === false">
        <template #icon>
          <EyeOutlined></EyeOutlined>
        </template>
        Schätzungen aufdecken
      </a-button>
    </div>
    <div>
      <a-button @click="handleCopy">
        <template #icon>
          <CopyOutlined />
        </template>
      </a-button>
      Token: {{gameToken}}
    </div>
    <div v-if="userRef" style="" class="top-bar_container top-bar_usercontainer">
      <ColorThemeChooser></ColorThemeChooser>
      <UserOutlined style="margin: .7rem;"/>
      <h1>{{userRef.name}}</h1>
      <a-button v-if="userRef && !userRef.isOwner" @click="handleSpectateFromPlayer" style="margin-left: 1.5rem;" >
        Zuschauer werden
        <template #icon>
          <UserSwitchOutlined />
        </template>
      </a-button>
      <a-button type="default" style="margin-left: 1.5rem;" @click="handleLeave()">
        Verlassen
        <template #icon><LogoutOutlined /></template>
      </a-button>
    </div>
    <div v-if="!userRef"  class="top-bar_container top-bar_usercontainer">
      <UserOutlined style="margin: .7rem;"/>
      <h1>Zuschauer</h1>
      <a-button @click="handleJoinGame" style="margin-left: 1.5rem;">
        Spiel beitreten
        <template #icon>
          <UserSwitchOutlined />
        </template>
      </a-button>
      <a-button type="default" style="margin-left: 1.5rem;" @click="handleLeaveSpectatorMode()">
        <template #icon><LogoutOutlined /></template>
      </a-button>
    </div>
  </div>
</template>

<style scoped>

h1 {
  margin: 0;
  font-size: 1.3em;
}
.top-bar_usercontainer {
  display: flex;
  align-items: center;
  justify-content: end;
}

.top-bar {
  flex-wrap: wrap;
  width: 100%;
  margin: 0 auto;
  background-image: linear-gradient(to right, rgba(var(--lingrad-a), 0.7), rgba(var(--lingrad-b), 0.7));
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.3rem;
  text-shadow: 1px 1px 5px black;
}
.top-bar_container {
  display: flex;
  flex-wrap: wrap;
  width: 35rem;
}

@media(max-width: 1295px) {
  .top-bar_usercontainer {
    justify-content: start;
    margin-top: .4rem;
  }
}
</style>