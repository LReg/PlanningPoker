<script setup lang="ts">
import { RouterView } from 'vue-router';
import { computed } from 'vue';
import currentTheme, { themeAccents } from '@/reactive/useTheme';

const colorPrimary = computed(() => themeAccents[currentTheme.value] ?? themeAccents.default);
</script>

<template>
  <a-config-provider
      :theme="{
        token: {
          colorPrimary: colorPrimary,
          colorBgContainer: 'var(--theme-container-color)',
          colorBgElevated: 'var(--surface-solid)',
          colorBorder: 'var(--surface-border)',
          colorBorderSecondary: 'var(--surface-border)',
          borderRadius: 14,
          borderRadiusLG: 18,
          borderRadiusSM: 10,
          controlHeight: 40,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          colorText: 'var(--text-color)',
          colorTextSecondary: 'var(--text-color-secondary)',
          colorTextTertiary: 'var(--text-color-secondary)',
          colorTextQuaternary: 'var(--text-color-secondary)',
          boxShadow: 'var(--shadow-md)',
          boxShadowSecondary: 'var(--shadow-sm)',
        }
      }"
  >
    <RouterView />
  </a-config-provider>
</template>

<style scoped>
</style>
