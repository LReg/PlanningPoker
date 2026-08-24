<script setup lang="ts">
import { RouterView } from 'vue-router';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import currentTheme, { themeAccents } from '@/reactive/useTheme';
import flashbangSubject from '@/reactive/useFlashbang';
import { Subject, takeUntil } from 'rxjs';

const colorPrimary = computed(() => themeAccents[currentTheme.value] ?? themeAccents.default);

const flashActive = ref(false);
const unsubscribe = new Subject<void>();
let flashTimeout: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  flashbangSubject.pipe(takeUntil(unsubscribe)).subscribe(() => {
    if (flashTimeout) {
      clearTimeout(flashTimeout);
    }
    // retrigger the animation even if it's already running
    flashActive.value = false;
    requestAnimationFrame(() => {
      flashActive.value = true;
      flashTimeout = setTimeout(() => {
        flashActive.value = false;
      }, 1400);
    });
  });
});
onUnmounted(() => {
  unsubscribe.next();
  unsubscribe.complete();
});
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
    <div class="flashbang-overlay" :class="{'flashbang-overlay--active': flashActive}"></div>
  </a-config-provider>
</template>

<style scoped>
.flashbang-overlay {
  position: fixed;
  inset: 0;
  background: #ffffff;
  opacity: 0;
  pointer-events: none;
  z-index: 9999;
}
.flashbang-overlay--active {
  animation: flashbang 1.4s cubic-bezier(.15, .8, .3, 1) forwards;
}
@keyframes flashbang {
  0% {
    opacity: 0;
  }
  4% {
    opacity: 1;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
