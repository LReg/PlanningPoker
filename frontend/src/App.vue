<script setup lang="ts">
import { RouterView } from 'vue-router';
import {Lit} from "litlyx-js";
import environment from "@/environments/environments";
Lit.init(environment.litProject, {
  server: {
    port: 3099,
    secure: false,
    host: environment.litDomain
  }
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
