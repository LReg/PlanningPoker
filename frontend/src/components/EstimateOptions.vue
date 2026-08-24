<script setup lang="ts">
import {ref} from "vue";
import Card from "@/components/Card.vue";
import {estimate} from "@/api/actionsService";

const props = defineProps(['hide', 'estimationOptions']);
const selected = ref(null);
const resetSelection = () => {
  selected.value = null;
}
defineExpose({resetSelection});
const choose = (option: any) => {
  estimate(option).then(
    () => {
      selected.value = option;
    }
  );
}
</script>

<template>
  <div class="estimates" :class="{hidden: props.hide ?? false}">
    <Card v-for="option in estimationOptions" :estimate="option" @click="choose(option)" clickable="true" :selected="selected === option"/>
  </div>
</template>

<style scoped>
.estimates {
  position: fixed;
  left: 50%;
  bottom: 1.2rem;
  transform: translate(-50%, 0);
  opacity: 1;
  pointer-events: auto;
  transition: transform 0.25s ease, opacity 0.25s ease;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  max-width: calc(100% - 2rem);
  gap: .9rem;
  justify-content: center;
  align-items: center;
  padding: 1rem 1.6rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--theme-container-color);
  backdrop-filter: blur(16px);
  box-shadow: var(--shadow-lg);
  z-index: 150;
}
.estimates.hidden {
  transform: translate(-50%, 1.5rem);
  opacity: 0;
  pointer-events: none;
}
@media(max-width: 950px) {
  .estimates {
    justify-content: start;
    left: 1rem;
    transform: translate(0, 0);
  }
  .estimates.hidden {
    transform: translate(0, 1.5rem);
    opacity: 0;
  }
}
</style>