<template>
  <section class="panel">
    <div class="panel-icon">
      <PlusOutlined />
    </div>
    <h2>Neues Spiel erstellen</h2>
    <p class="panel-hint">Starte eine neue Schätzrunde für dein Team.</p>
    <div class="panel-fields">
      <a-input v-model:value="sessionName" placeholder="Sitzungsname" size="large"></a-input>
      <a-input v-model:value="playerName" placeholder="Dein Spielername" size="large" @keydown.enter="handleCreateGame"></a-input>
    </div>
    <a-button type="primary" size="large" block class="cta-button" @click="handleCreateGame">Sitzung erstellen</a-button>
  </section>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import {createGame} from "@/api/joinLeaveService";
import {useRouter} from "vue-router";
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
const router = useRouter();
const handleCreateGame = () => {
  createGame(sessionName.value, playerName.value)
      .then((token) => {
        router.push('/game/' + token);
      }).catch((error) => {
        message.error('Erstellen fehlgeschlagen, vermutlich ist das Backend nicht erreichbar.');
      });
}
const sessionName = ref('');
const playerName = ref('');
</script>
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
  background-image: linear-gradient(135deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
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
.cta-button {
  margin-top: 1rem;
  border-radius: var(--radius-sm);
  border: none;
  background-image: linear-gradient(105deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  font-weight: 600;
}
</style>
