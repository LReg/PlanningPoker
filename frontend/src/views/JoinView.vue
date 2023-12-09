<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {} from "@/api/joinLeaveService";
import JoinGame from "@/components/JoinGame.vue";
const route = useRoute();
const router = useRouter();
const gameToken: string = (typeof route.params.token === 'object' ? route.params.token[0] : route.params.token);
const handleGuestJoin = () => {
  router.push('/game/' + gameToken);
}
</script>

<template>
  <div class="container">
    <JoinGame :gameToken="gameToken"></JoinGame>
    <a-button @click="handleGuestJoin()" type="primary" class="guest-button">Als Zuschauer beitreten</a-button>
  </div>
</template>

<style scoped>
.guest-button {
  margin: 1rem auto;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 5rem auto;
  width: 30rem;
}
</style>