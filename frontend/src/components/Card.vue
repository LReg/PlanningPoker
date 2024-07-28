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
  height: 5rem;
  flex-shrink: 0;
  width: 3rem;
  border-radius: 3px;
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.46);
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.25));
}
.clickable {
  cursor: pointer;
  transition: all 0.3s;
}
.clickable:hover {
  transform: translateY(-13px);
}
span {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.6em;
}
.selected {
  background-image: linear-gradient(135deg, rgba(var(--lingrad-a), 0.5), rgba(var(--lingrad-b), 0.5));
}
</style>