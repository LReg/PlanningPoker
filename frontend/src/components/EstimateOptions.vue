<script setup lang="ts">
import {ref} from "vue";
import Card from "@/components/Card.vue";
import {estimate} from "@/api/actionsService";

const props = defineProps(['hide']);
const options = ref(['🤷‍♂️', '☕', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '144']);
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
  <div class="estimates" :style="{'transform': props.hide?? false ? 'translateY(6rem)': '', 'transition': 'transform 0.2s linear'}">
    <Card v-for="option in options" :estimate="option" @click="choose(option)" clickable="true" :selected="selected === option"/>
  </div>
</template>

<style scoped>
.estimates {
  position: absolute;
  bottom: 0;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1rem 2rem;
  background-image: linear-gradient(to right, rgba(var(--lingrad-a), 0.3), rgba(var(--lingrad-b), 0.3));
}
@media(max-width: 950px) {
  .estimates {
    justify-content: start;
  }
}
</style>