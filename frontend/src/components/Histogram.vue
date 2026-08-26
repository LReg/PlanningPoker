<script setup lang="ts">
import type { EstimationHistogram } from '@/models/EstimationHistogram';
import type {PropType} from "vue";
import {computed} from "vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object as PropType<EstimationHistogram>,
    required: true,
  },
  hide: {
    type: Boolean,
    default: true,
  }
})

const entries = computed(() => {
  return Object.entries(props.data?.estimationCount ?? {})
      .filter(([, count]) => count > 0);
});
const maxCount = computed(() => Math.max(1, ...entries.value.map(([, count]) => count)));
const evaluateHeightRem = (value: number) => `${(value / maxCount.value) * 6}rem`;
</script>

<template>
<div class="histogramContainer" :class="{hidden: props.hide ?? false}">
  <div v-if="entries.length === 0" class="empty">{{ t('histogram.empty') }}</div>
  <div v-for="[label, count] in entries" :key="label" class="estimation">
    <div class="bar" :style="{height: evaluateHeightRem(count)}"></div>
    <span class="bar-count">{{count}}</span>
    <span class="bar-label">{{label}}</span>
  </div>
</div>
</template>

<style scoped>
.bar {
  border-radius: 999px 999px 4px 4px;
  background-image: linear-gradient(180deg, rgb(var(--lingrad-b)), rgb(var(--lingrad-a)));
  width: 14px;
  min-height: 4px;
  box-shadow: var(--shadow-sm);
}
.estimation {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 2rem;
  gap: .4rem;
}
.bar-count {
  font-size: .72em;
  font-weight: 700;
  color: var(--text-color-secondary);
}
.bar-label {
  font-size: .8em;
  font-weight: 600;
}
.empty {
  font-size: .85em;
  color: var(--text-color-secondary);
  padding: .5rem 1rem;
}
.histogramContainer {
  width: min(70vw, 40rem);
  position: fixed;
  left: 50%;
  bottom: 9rem;
  transform: translate(-50%, 0);
  opacity: 1;
  pointer-events: auto;
  transition: opacity .3s ease, transform .3s ease;
  padding: 1.6rem 1.6rem 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--theme-container-color);
  backdrop-filter: blur(16px);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  gap: 1rem;
  overflow-x: auto;
  z-index: 140;
}
.histogramContainer.hidden {
  opacity: 0;
  transform: translate(-50%, .75rem);
  pointer-events: none;
}
</style>
