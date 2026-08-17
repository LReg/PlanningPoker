<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <a-config-provider
      :theme="{
        token: {
          colorPrimary: 'var(--text-color)',
          colorBgContainer: 'var(--theme-container-color)',
          colorBorder: '',
          borderRadius: 8,
          colorText: 'var(--text-color)',
          colorTextSecondary: 'var(--text-color)',
          colorTextTertiary: 'var(--text-color)',
          colorTextQuaternary: 'var(--text-color)',
        }
      }"
  >
    <RouterView />
  </a-config-provider>
</template>

<style scoped>
</style>
