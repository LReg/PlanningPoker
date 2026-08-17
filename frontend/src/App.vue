<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import {Lit} from "litlyx-js";
import environment from "@/environments/environments";

// Deferred to onMounted: App.vue is imported (and its top-level script run) before
// main.ts's `await loadRuntimeConfig()` resolves, so `environment` isn't populated yet
// at module-evaluation time — only by the time this component actually mounts.
onMounted(() => {
  Lit.init(environment.litProject, {
    server: {
      port: 443,
      secure: true,
      host: environment.litDomain
    }
  })
})
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
