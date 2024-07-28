<script setup lang="ts">
import CreateGame from "@/components/CreateGame.vue";
import JoinGame from "@/components/JoinGame.vue";
import {useRouter} from "vue-router";
const router = useRouter();
const sessionToken = localStorage.getItem('sessionToken');
if (sessionToken) {
  router.push('/game/' + sessionToken);
}
</script>

<template>
  <main style="display: flex; gap: 1rem; justify-content: center; width: 100vw; height: 100vh; align-items: center;">
    <CreateGame/>
    <JoinGame />
  </main>
</template>
