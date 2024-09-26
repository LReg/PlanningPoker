<script setup lang="ts">
import CreateGame from "@/components/CreateGame.vue";
import JoinGame from "@/components/JoinGame.vue";
import {useRouter} from "vue-router";
import {getActiveSessions} from "@/api/actionsService";
import {ref} from "vue";
import type {Ref} from "vue";
import type {ActiveSessions} from "@/models/ActiveSessions";
import Footer from "@/components/Footer.vue";
import environment from "@/environments/environments";
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
  <div class="home-container">
    <aside class="info" v-if="activeSessions !== null">
      <span>Sitzungen >= 1 Nutzer: {{activeSessions.active}}</span><br/>
      <span>Sitzungen alle: {{activeSessions.total}}</span>
    </aside>
    <main class="join-create-container">
      <CreateGame/>
      <JoinGame />
    </main>
    <div v-if="environment.devServer" class="testserver-message">
      <p>
        <h2>Du nutzt einen Testserver</h2>
        Eventuell funktionieren bei dieser Version einige Funktionen noch nicht.<br/>
        Du kannst Informationen über die aktuelle Version in den <RouterLink to="/changelog">Changelogs</RouterLink> finden.<br/>
        Die Produktivversion findest du <a :href="environment.productionAddress" target="_blank">hier</a>.
      </p>
    </div>
    <div class="footer-container">
      <Footer></Footer>
    </div>
  </div>
</template>
<style scoped>
.testserver-message {
  margin: 1rem auto;
  max-width: 30rem;
  border: 1px solid #91caff;
  background-color: #e6f4ff;
  padding: 1rem;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 8px;
}
.home-container {
  height: 100vh;
}
.join-create-container {
  display: flex;
  gap: 1rem;
  padding-top: 25vh;
  justify-content: center;
  align-items: center;
}
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
.footer-container {
  position: fixed;
  bottom: 0;
  width: 100vw;
}
</style>

