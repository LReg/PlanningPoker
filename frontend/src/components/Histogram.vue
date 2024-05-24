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
    <span>{{entry}}</span>
  </div>
</div>
</template>

<style scoped>
.bar {
  border-radius: 5px;
  background-image: linear-gradient(135deg, rgba(var(--lingrad-a), 0.5), rgba(var(--lingrad-b), 0.5));
  width: 10px;
}
.estimation {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 1.5rem;
  gap: .5rem;
}
.histogramContainer {
  width: 70vw;
  height: 11rem;
  position: absolute;
  bottom: 2rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  gap: 1rem;
}
</style>