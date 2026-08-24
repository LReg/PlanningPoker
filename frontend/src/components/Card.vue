<script setup lang="ts">
const props = defineProps(['estimate', 'clickable', 'selected']);
</script>

<template>
  <div :class="'estimate-card ' + (clickable ? 'clickable ' : '') + (selected ? 'selected ' : '') ">
    <span v-if="estimate === null">
      X
    </span>
    <span v-if="typeof estimate === 'string'">
      {{ estimate }}
    </span>
    <span v-if="typeof estimate === 'number' && estimate === -1">?</span>
  </div>
</template>

<style scoped>
.estimate-card {
  user-select: none;
  height: 5.2rem;
  flex-shrink: 0;
  width: 3.4rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-sm);
  background-color: var(--surface-solid);
  background-image: linear-gradient(150deg, rgba(var(--lingrad-a), 0.06), rgba(var(--lingrad-b), 0.1));
  transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s ease, border-color .25s ease;
}
.clickable {
  cursor: pointer;
}
.clickable:hover {
  transform: translateY(-13px);
  box-shadow: var(--shadow-md);
  border-color: rgba(var(--lingrad-a), 0.4);
}
span {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.6em;
  font-weight: 700;
  font-family: 'Manrope', 'Inter', sans-serif;
  color: var(--text-color);
}
.selected {
  border-color: transparent;
  box-shadow: var(--shadow-md);
  background-image: linear-gradient(150deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
}
.selected span {
  color: white;
}
</style>