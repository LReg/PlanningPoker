<script setup lang="ts">
import type { EstimationHistogram } from '@/models/EstimationHistogram';
import type {PropType} from "vue";

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
const evaluateHeightRem = (value: number) => {
  const highestEstimation = Math.max(...(Object.values(props.data?.estimationCount)));
  const highestPossibleRem = 9
  // evalue Hight in REM when 9 is
  return `${(value / highestEstimation) * highestPossibleRem}rem`
}

</script>

<template>
<div class="histogramContainer" :style="{'opacity': props.hide ?? false ? '0' : '1', 'transition': 'opacity 0.4s linear'}">
  <div v-for="entry in Object.keys(props.data?.estimationCount)" class="estimation">
    <div class="bar" :style="{'height': evaluateHeightRem(props.data?.estimationCount[entry as unknown as number])}"></div>
    <span class="bar-count">{{props.data?.estimationCount[entry as unknown as number]}}</span>
    <span class="bar-label">{{entry}}</span>
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
.histogramContainer {
  width: min(70vw, 40rem);
  max-height: 11rem;
  position: fixed;
  left: 50%;
  bottom: 9rem;
  transform: translateX(-50%);
  padding: 1.2rem 1.6rem .8rem;
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
</style>