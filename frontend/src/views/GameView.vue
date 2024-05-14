<script setup lang="ts">
import env from '@/environments/environments';
import {useRoute, useRouter} from "vue-router";
import {pullSessionInfo, openSession} from "@/api/actionsService";
import {tryReconnectFromBrowserStorage, leaveGame, spectateGame, exitSpectateGame} from "@/api/joinLeaveService";
import userRef from "@/reactive/useUser";
import sessionRef from "@/reactive/useSession";
import User from "@/components/User.vue";
import {LogoutOutlined, UserOutlined, EyeOutlined, EyeInvisibleOutlined, CopyOutlined} from "@ant-design/icons-vue";
import EstimateOptions from "@/components/EstimateOptions.vue";
import {ref, watch} from "vue";
import { message } from 'ant-design-vue';
import Chat from "@/components/Chat.vue";
import {clearMessages} from "@/api/chatService";
import ColorThemeChooser from "@/components/ColorThemeChooser.vue";
import estimationHistogram from "@/reactive/useEstimationHistogram";
import Histogram from "@/components/Histogram.vue";
const router = useRouter();
const route = useRoute();
const gameToken: string = (typeof route.params.token === 'object' ? route.params.token[0] : route.params.token);
const estimateOptionsRef = ref(null);

if (sessionRef.value === null) {
  pullSessionInfo(gameToken).catch(() => {
    router.push('/');
  });
  if (!localStorage.getItem('userToken')) {
    spectateGame(gameToken).then(
      () => {
        message.success('Du bist nun Zuschauer.');
      }
    ).catch(() => {
      clearMessages();
      router.push('/');
    });
  }
  else {
    tryReconnectFromBrowserStorage(gameToken)
        .then(
            () => {
              message.success('Du bist nun wieder in der Sitzung.');
            }
        )
        .catch(() => {
          clearMessages();
          localStorage.clear();
          router.push('/');
    });
  }
}
const handleLeave = () => {
  if (!userRef.value)
    return;
  leaveGame(gameToken, userRef.value.token).then(() => {
    router.push('/');
  });
}
const toggleOpen = async () => {
  if (!sessionRef.value)
    return;
  await openSession(!sessionRef.value.open);
}

watch(sessionRef, (newValue, oldValue) => {
  if (newValue?.open === false && oldValue?.open === true)
    // @ts-ignore
    estimateOptionsRef?.value?.resetSelection();
});

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

</script>
<template>
  <div class="top-bar">
    <div style="display: flex; align-items: center; gap: 1rem;" class="top-bar_container">
      <h1 v-if="sessionRef">
        {{ sessionRef.name }}
      </h1>
      <a-button @click="toggleOpen()" v-if="userRef && userRef.isOwner && sessionRef && sessionRef.open === true" ghost>
        <template #icon>
          <EyeInvisibleOutlined></EyeInvisibleOutlined>
        </template>
        neue Schätzung
      </a-button>
      <a-button @click="toggleOpen()" v-if="userRef && userRef.isOwner && sessionRef && sessionRef.open === false" ghost>
        <template #icon>
          <EyeOutlined></EyeOutlined>
        </template>
        Schätzungen aufdecken
      </a-button>
    </div>
    <div>
      <a-button ghost @click="handleCopy">
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
      <a-button type="default" ghost style="margin-left: 1.5rem; margin-top: .2rem;" @click="handleLeave()">
        <template #icon><LogoutOutlined /></template>
      </a-button>
    </div>
    <div v-if="!userRef"  class="top-bar_container top-bar_usercontainer">
      <UserOutlined style="margin: .7rem;"/>
      <h1>Zuschauer</h1>
        <a-button type="default" ghost style="margin-left: 1.5rem; margin-top: .2rem;" @click="handleLeaveSpectatorMode()">
          <template #icon><LogoutOutlined /></template>
        </a-button>
    </div>
  </div>
  <div class="content_container">
    <div v-if="sessionRef" class="userContainer">
      <User v-for="user of sessionRef.players" :id="user.id" :estimate="user.estimate" :username="user.name"></User>
    </div>
    <div class="chat_container">
      <Chat></Chat>
    </div>
  </div>
  <Histogram v-if="sessionRef && userRef && estimationHistogram" :data="estimationHistogram" :hide="!sessionRef?.open"></Histogram>
  <EstimateOptions v-if="sessionRef && userRef" ref="estimateOptionsRef" :hide="sessionRef?.open" class="estimations"></EstimateOptions>
</template>

<style scoped>
.estimations {
  transition: top 0.5s linear;
}
.userContainer{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  width: 70vw;
  min-width: 17rem;
  padding: 1rem;
  overflow-y: auto;
}
.top-bar_usercontainer {
  display: flex;
  align-items: center;
  justify-content: end;
}

.top-bar {
  flex-wrap: wrap;
  width: 100vw;
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
h1 {
  margin: 0;
  font-size: 1.3em;
}
.content_container {
  display: flex;
  position: absolute;
  gap: 1rem;
  top: 8rem;
  bottom: 9rem;
  width: 100vw;
  overflow-x: auto;
}
.chat_container {
  min-width: 17rem;
  padding: 2rem;
  width: 30vw;
  border-left: 1px solid grey;
}

@media(max-width: 1295px) {
  .top-bar_usercontainer {
    justify-content: start;
  }
  .content_container {
    top: 10rem;
  }
}
</style>
