<script setup lang="ts">
import {ref} from "vue";
import {joinGame} from "@/api/joinLeaveService";
import {useRouter} from "vue-router";
import {message} from "ant-design-vue";
import { TeamOutlined } from '@ant-design/icons-vue';

const props = defineProps(['gameToken']);
const emit = defineEmits(['joinGame']);
const router = useRouter();
const handleJoinGame = () => {
  joinGame(sessionToken.value, playerName.value).then(() => {
    router.push('/game/' + sessionToken.value);
  }).catch((error) => {
    message.error('Beitreten fehlgeschlagen, das Spiel scheint nicht (mehr) zu existieren.');
    console.error(error);
  });
};
const handleSpectate = () => {
  if (sessionToken.value === '')
    return;
  router.push('/game/' + sessionToken.value);
};
const sessionToken = ref(props.gameToken ?? '');
const playerName = ref('');
</script>

<template>
  <section class="panel">
    <div class="panel-icon">
      <TeamOutlined />
    </div>
    <h2>Spiel beitreten</h2>
    <p class="panel-hint">Nutze den Token, den du von deinem Team bekommen hast.</p>
    <div class="panel-fields">
      <a-input v-model:value="sessionToken" placeholder="Sitzungstoken" size="large"></a-input>
      <a-input v-model:value="playerName" placeholder="Dein Spielername" size="large" @keydown.enter="handleJoinGame"></a-input>
    </div>
    <div class="panel-actions">
      <a-button type="primary" size="large" class="cta-button" @click="handleJoinGame">Beitreten</a-button>
      <a-button size="large" @click="handleSpectate">Zuschauen</a-button>
    </div>
  </section>
</template>

<style scoped>
.panel {
  width: 20rem;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .4rem;
  padding: 2rem;
  text-align: left;
  background: var(--theme-container-color);
  backdrop-filter: blur(14px);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: transform .25s ease, box-shadow .25s ease;
}
.panel:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.panel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: var(--radius-sm);
  background-image: linear-gradient(135deg, rgb(var(--lingrad-b)), rgb(var(--lingrad-a)));
  color: white;
  font-size: 1.1em;
  margin-bottom: .4rem;
}
.panel h2 {
  font-size: 1.2em;
  margin: 0;
}
.panel-hint {
  color: var(--text-color-secondary);
  font-size: .88em;
  margin-bottom: .6rem;
}
.panel-fields {
  display: flex;
  flex-direction: column;
  gap: .7rem;
  width: 100%;
}
.panel-actions {
  display: flex;
  gap: .6rem;
  width: 100%;
  margin-top: 1rem;
}
.panel-actions :deep(.ant-btn) {
  flex: 1;
}
.cta-button {
  border-radius: var(--radius-sm);
  border: none;
  background-image: linear-gradient(105deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  font-weight: 600;
}
</style>
