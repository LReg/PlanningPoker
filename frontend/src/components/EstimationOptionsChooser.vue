<script setup lang="ts">
import { InteractionOutlined } from '@ant-design/icons-vue';
import {parseEstimationType} from "@/models/Session.model";
import {changeEstimationType} from "@/api/actionsService";

const handleMenuClick = (e: any) => {
  const estimationTypeString = e.key;
  const estimationType = parseEstimationType(estimationTypeString);
  if (!estimationType)
    return;
  changeEstimationType(estimationType);
}

</script>


<template>
  <a-dropdown @click.prevent>
    <InteractionOutlined :style="{fontSize: '24px'}"/>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item key="Fibonacci">
          Fibonacci
        </a-menu-item>
        <a-menu-item key="PowersOfTwo">
          Powers of Two
        </a-menu-item>
        <a-menu-item key="TShirtSizes">
          T-Shirt Sizes
        </a-menu-item>
        <a-menu-item key="PersonDays">
          Personentage
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<style scoped>

</style>