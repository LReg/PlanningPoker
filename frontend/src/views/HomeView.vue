<script setup lang="ts">
import CreateGame from "@/components/CreateGame.vue";
import JoinGame from "@/components/JoinGame.vue";
import {useRouter} from "vue-router";
import {getActiveSessions} from "@/api/actionsService";
import {ref} from "vue";
import type {Ref} from "vue";
import type {ActiveSessions} from "@/models/ActiveSessions";
const router = useRouter();
const sessionToken = localStorage.getItem('sessionToken');
if (sessionToken) {
  router.push('/game/' + sessionToken);
}
const activeSessions: Ref<ActiveSessions | null> = ref(null);
getActiveSessions().then(info => {
  activeSessions.value = info;
});
</script>

<template>
  <aside class="info" v-if="activeSessions !== null">
    <span>Sitzungen >= 1 Nutzer: {{activeSessions.active}}</span><br/>
    <span>Sitzungen alle: {{activeSessions.total}}</span>
  </aside>
  <main style="display: flex; gap: 1rem; justify-content: center; width: 100vw; height: 100vh; align-items: center;">
    <CreateGame/>
    <JoinGame />
  </main>
</template>
<style scoped>
.info {
  font-size: .7em;
  position: fixed;
  top: 0;
  right: 0;
  padding: .5rem;
  background-color: var(--theme-container-color);
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  border-radius: 0 0 0 1rem;
  z-index: 100;
}
</style>

