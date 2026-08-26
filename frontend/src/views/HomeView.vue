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
import ColorThemeChooser from "@/components/ColorThemeChooser.vue";
import LanguageChooser from "@/components/LanguageChooser.vue";
import currentTheme from "@/reactive/useTheme";
import {computed} from "vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const launcherTheme = computed(() => currentTheme.value === 'dark' ? 'dark' : 'light');
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
    <app-launcher current="planning-poker" :theme="launcherTheme" class="launcher"></app-launcher>
    <div class="top-right">
      <aside class="info" v-if="activeSessions !== null">
        <span class="info-dot"></span>
        <span>{{ t('home.activeSessions', {active: activeSessions.active, total: activeSessions.total}) }}</span>
      </aside>
      <LanguageChooser variant="surface"></LanguageChooser>
      <ColorThemeChooser variant="surface"></ColorThemeChooser>
    </div>
    <main class="hero">
      <div class="hero-heading">
        <span class="eyebrow">Planning Poker</span>
        <h1 v-html="t('home.heading')"></h1>
        <p class="subtitle">{{ t('home.subtitle') }}</p>
      </div>
      <div class="join-create-container">
        <CreateGame/>
        <JoinGame />
      </div>
    </main>
    <div v-if="environment.devServer" class="testserver-message">
      <h2>{{ t('home.testserver.title') }}</h2>
      <p>
        {{ t('home.testserver.line1') }}<br/>
        {{ t('home.testserver.line2Pre') }} <RouterLink to="/changelog">{{ t('home.testserver.changelogLink') }}</RouterLink> {{ t('home.testserver.line2Post') }}<br/>
        {{ t('home.testserver.line3Pre') }} <a :href="environment.productionAddress" target="_blank">{{ t('home.testserver.here') }}</a>.
      </p>
    </div>
    <div class="footer-container">
      <Footer></Footer>
    </div>
  </div>
</template>
<style scoped>
.testserver-message {
  margin: 2rem auto;
  max-width: 30rem;
  border: 1px solid var(--surface-border);
  background-color: var(--theme-container-color);
  backdrop-filter: blur(10px);
  padding: 1.2rem 1.5rem;
  font-size: 14px;
  line-height: 1.5;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.testserver-message h2 {
  font-size: 1.1em;
  margin-bottom: .4rem;
}
.testserver-message a {
  color: rgb(var(--lingrad-a));
  font-weight: 600;
}
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 7rem 1.5rem 3rem;
  text-align: center;
}
.hero-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 40rem;
  animation: fade-in-up .5s ease both;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .35rem .9rem;
  border-radius: 999px;
  background: rgba(var(--lingrad-a), 0.12);
  color: rgb(var(--lingrad-a));
  font-weight: 700;
  font-size: .8em;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.hero h1 {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 800;
  line-height: 1.12;
  background-image: linear-gradient(105deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.subtitle {
  color: var(--text-color-secondary);
  font-size: 1.08em;
  max-width: 32rem;
}
.join-create-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  align-items: stretch;
  animation: fade-in-up .6s .1s ease both;
}
.top-right {
  position: fixed;
  top: .8rem;
  right: .8rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: .6rem;
  max-width: calc(100vw - 1.6rem);
  z-index: 100;
}
.info {
  font-size: .78em;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .5rem 1rem;
  background-color: var(--theme-container-color);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--surface-border);
  border-radius: 999px;
}
.info-dot {
  width: .5rem;
  height: .5rem;
  border-radius: 999px;
  background-image: linear-gradient(135deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  box-shadow: 0 0 0 3px rgba(var(--lingrad-a), 0.18);
}
.launcher {
  position: fixed;
  top: .8rem;
  left: .8rem;
  z-index: 100;
}
.footer-container {
  width: 100%;
}
</style>

