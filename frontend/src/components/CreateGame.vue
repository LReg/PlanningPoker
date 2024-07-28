<template>
  <a-card
      title="Erstelle ein neues Spiel"
      hoverable
  >
    <div>
      <a-input v-model:value="sessionName" placeholder="Sitzungsname" class="mb"></a-input>
      <a-input v-model:value="playerName" placeholder="Dein Spielername"></a-input>
    </div>
    <template #actions>
      <a-button type="primary" @click="handleCreateGame">Erstellen</a-button>
    </template>
  </a-card>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import {createGame} from "@/api/joinLeaveService";
import {useRouter} from "vue-router";
import { message } from 'ant-design-vue';
const router = useRouter();
const handleCreateGame = () => {
  createGame(sessionName.value, playerName.value)
      .then((token) => {
        router.push('/game/' + token);
      }).catch((error) => {
        message.error('Erstellen fehlgeschlagen, vermutlich ist das Backend nicht erreichbar.');
        message.error(error);
      });
}
const sessionName = ref('');
const playerName = ref('');
</script>
<style scoped>
.mb {
  margin-bottom: 10px;
}
</style>
