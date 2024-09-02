<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {pullSessionInfo, openSession} from "@/api/actionsService";
import {tryReconnectFromBrowserStorage, spectateGame} from "@/api/joinLeaveService";
import userRef from "@/reactive/useUser";
import sessionRef from "@/reactive/useSession";
import User from "@/components/User.vue";
import EstimateOptions from "@/components/EstimateOptions.vue";
import {ref, watch} from "vue";
import { message } from 'ant-design-vue';
import Chat from "@/components/Chat.vue";
import {clearMessages} from "@/api/chatService";
import estimationHistogram from "@/reactive/useEstimationHistogram";
import Histogram from "@/components/Histogram.vue";
import TopBar from "@/components/TopBar.vue";

const router = useRouter();
const route = useRoute();
const gameToken: string = (typeof route.params.token === 'object' ? route.params.token[0] : route.params.token);
const estimateOptionsRef = ref(null);

if (sessionRef.value === null) {
  pullSessionInfo(gameToken).catch(() => {
    // TODO if you would want to reopen a session this is where to start
    message.error('Die Sitzung ist abgelaufen, du musst eine neue erstellen.');
    router.push('/');
  });
  if (!localStorage.getItem('userToken')) {
    // kein Usertoken vorhanden -> Zuschauermodus
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
    // Usertoken vorhanden -> versuche Wiederverbindung
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

watch(sessionRef, (newValue, oldValue) => {
  if (newValue?.open === false && oldValue?.open === true)
    // @ts-ignore
    estimateOptionsRef?.value?.resetSelection();
});

</script>
<template>
  <TopBar></TopBar>
  <div class="content_container">
    <div v-if="sessionRef" class="userContainer">
      <User v-for="user of sessionRef.players" :id="user.id" :estimate="user.estimate" :username="user.name"></User>
    </div>
    <div class="chat_container">
      <Chat></Chat>
    </div>
  </div>
  <Histogram v-if="sessionRef && estimationHistogram" :data="estimationHistogram" :hide="!sessionRef?.open"></Histogram>
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
  width: 70%;
  min-width: 17rem;
  padding: 1rem;
  overflow-y: auto;
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
  width: 100%;
  overflow-x: auto;
}
.chat_container {
  min-width: 17rem;
  padding: 2rem;
  width: 30%;
  border-left: 1px solid grey;
}

@media(max-width: 1295px) {
  .content_container {
    top: 10rem;
  }
}
</style>
