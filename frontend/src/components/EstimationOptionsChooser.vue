<script setup lang="ts">
import { InteractionOutlined } from '@ant-design/icons-vue';
import {parseEstimationType} from "@/models/Session.model";
import {changeEstimationType} from "@/api/actionsService";
import {useI18n} from "vue-i18n";

const { t } = useI18n();

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
    <button class="chooser-trigger" :aria-label="t('estimationOptions.label')" :title="t('estimationOptions.label')">
      <InteractionOutlined :style="{fontSize: '18px'}"/>
    </button>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item key="Fibonacci">
          {{ t('estimationOptions.fibonacci') }}
        </a-menu-item>
        <a-menu-item key="PowersOfTwo">
          {{ t('estimationOptions.powersOfTwo') }}
        </a-menu-item>
        <a-menu-item key="TShirtSizes">
          {{ t('estimationOptions.tShirtSizes') }}
        </a-menu-item>
        <a-menu-item key="PersonDays">
          {{ t('estimationOptions.personDays') }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<style scoped>
.chooser-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.14);
  color: inherit;
  cursor: pointer;
  transition: background .2s ease, transform .2s ease;
}
.chooser-trigger:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}
</style>