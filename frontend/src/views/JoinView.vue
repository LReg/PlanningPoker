<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {} from "@/api/joinLeaveService";
import JoinGame from "@/components/JoinGame.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const gameToken: string = (typeof route.params.token === 'object' ? route.params.token[0] : route.params.token);

const handleHome = () => {
  router.push('/');
}
</script>

<template>
  <div class="container">
    <JoinGame :gameToken="gameToken"></JoinGame>
    <a-button @click="handleHome" type="default" class="guest-button">{{ t('common.home') }}</a-button>
  </div>
</template>

<style scoped>
.guest-button {
  margin: 1.2rem auto 0;
  border-radius: var(--radius-sm);
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 6rem auto;
  width: 30rem;
  max-width: 90vw;
}
</style>