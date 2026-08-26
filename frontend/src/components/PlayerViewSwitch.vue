<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons-vue";
import playerViewModeRef from "@/reactive/usePlayerViewMode";
import type { PlayerViewMode } from "@/reactive/usePlayerViewMode";

const { t } = useI18n();

const setMode = (mode: PlayerViewMode) => {
  playerViewModeRef.value = mode;
}
</script>

<template>
  <div class="view-switch">
    <button
        class="view-option"
        :class="{active: playerViewModeRef === 'grid'}"
        :title="t('playerView.grid')"
        :aria-label="t('playerView.grid')"
        @click="setMode('grid')"
    >
      <AppstoreOutlined/>
    </button>
    <button
        class="view-option"
        :class="{active: playerViewModeRef === 'list'}"
        :title="t('playerView.list')"
        :aria-label="t('playerView.list')"
        @click="setMode('list')"
    >
      <UnorderedListOutlined/>
    </button>
  </div>
</template>

<style scoped>
.view-switch {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: .2rem;
  gap: .1rem;
  border: 1px solid var(--surface-border);
  background: var(--theme-container-color);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
}
.view-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: background .2s ease, color .2s ease;
}
.view-option:hover {
  color: var(--text-color);
}
.view-option.active {
  background-image: linear-gradient(105deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  color: #ffffff;
}
</style>
