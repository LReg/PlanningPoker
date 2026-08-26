<script setup lang="ts">
import { RouterView } from 'vue-router';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import currentTheme, { themeAccents } from '@/reactive/useTheme';
import flashbangSubject from '@/reactive/useFlashbang';
import { Subject, takeUntil } from 'rxjs';

const colorPrimary = computed(() => themeAccents[currentTheme.value] ?? themeAccents.default);

const grenadeActive = ref(false);
const flashActive = ref(false);
const unsubscribe = new Subject<void>();
let grenadeTimeout: ReturnType<typeof setTimeout> | null = null;
let flashTimeout: ReturnType<typeof setTimeout> | null = null;

const GRENADE_FLIGHT_MS = 500;
const FLASH_DURATION_MS = 2800;

onMounted(() => {
  flashbangSubject.pipe(takeUntil(unsubscribe)).subscribe(() => {
    if (grenadeTimeout) {
      clearTimeout(grenadeTimeout);
    }
    if (flashTimeout) {
      clearTimeout(flashTimeout);
    }
    // retrigger the animation even if it's already running
    grenadeActive.value = false;
    flashActive.value = false;
    requestAnimationFrame(() => {
      grenadeActive.value = true;
      grenadeTimeout = setTimeout(() => {
        grenadeActive.value = false;
        flashActive.value = true;
        flashTimeout = setTimeout(() => {
          flashActive.value = false;
        }, FLASH_DURATION_MS);
      }, GRENADE_FLIGHT_MS);
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
    <img class="flashbang-grenade" :class="{'flashbang-grenade--active': grenadeActive}" src="/flashbang.png" alt=""/>
    <div class="flashbang-overlay" :class="{'flashbang-overlay--active': flashActive}"></div>
  </a-config-provider>
</template>

<style scoped>
.flashbang-grenade {
  position: fixed;
  left: 50%;
  top: 50%;
  height: 3.6rem;
  width: auto;
  opacity: 0;
  pointer-events: none;
  z-index: 9998;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45));
  will-change: transform, opacity;
}
.flashbang-grenade--active {
  animation: flashbang-grenade-throw .5s cubic-bezier(.25, .55, .35, 1) forwards;
}
@keyframes flashbang-grenade-throw {
  0% {
    transform: translate(calc(-50% + 60vw), calc(-50% + 48vh)) scale(0.5) rotate(0deg);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.3) rotate(680deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.9) rotate(760deg);
    opacity: 0;
  }
}
.flashbang-overlay {
  position: fixed;
  inset: 0;
  background: #ffffff;
  opacity: 0;
  pointer-events: none;
  z-index: 9999;
}
.flashbang-overlay--active {
  animation: flashbang 2.8s cubic-bezier(.15, .8, .3, 1) forwards;
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
