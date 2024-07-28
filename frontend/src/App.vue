<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <a-config-provider
      :theme="{
        token: {
          colorPrimary: 'black',
        }
      }"
  >
    <RouterView />
  </a-config-provider>
</template>

<style scoped>
</style>
