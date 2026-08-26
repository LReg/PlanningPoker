<template>
  <div class="card-container">
    <RouterLink to="/"><a-button class="home-button">{{ t('common.home') }}</a-button></RouterLink>
    <a-card class="card" :title="t('request.changeViewCardTitle')" hoverable>
      <user-request-form request-type="changerequest"></user-request-form>
    </a-card>
  </div>
</template>
<script setup lang="ts">
import UserRequestForm from "@/components/UserRequestForm.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
<style scoped>

.card-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 1.5rem;
}
.home-button {
  border-radius: var(--radius-sm);
}
.card {
  width: 30rem;
  max-width: 100%;
  margin: 0 auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--theme-container-color);
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow-md);
}
</style>