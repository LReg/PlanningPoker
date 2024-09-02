<script setup lang="ts">
import {ref} from "vue";
import {joinGame} from "@/api/joinLeaveService";
import {useRouter} from "vue-router";
import {message} from "ant-design-vue";

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
const sessionToken = ref(props.gameToken ?? '');
const playerName = ref('');
</script>

<template>
  <main>
    <a-card
        style="width: 100%"
        title="Trete einem Spiel bei"
        hoverable
    >
      <div>
        <a-input v-model:value="sessionToken" placeholder="Siztungstoken" class="mb"></a-input>
        <a-input v-model:value="playerName" placeholder="Dein Spielername"></a-input>
      </div>
      <template #actions>
        <a-button type="primary" @click="handleJoinGame">Beitreten</a-button>
      </template>
    </a-card>
  </main>
</template>

<style scoped>
.mb {
  margin-bottom: 10px;
}
</style>