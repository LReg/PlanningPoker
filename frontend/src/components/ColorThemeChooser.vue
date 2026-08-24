<script setup lang="ts">
import { BgColorsOutlined } from '@ant-design/icons-vue';
import {onMounted, ref} from "vue";
import currentTheme from "@/reactive/useTheme";

withDefaults(defineProps<{variant?: 'bar' | 'surface'}>(), {variant: 'bar'});

const themes = [
  { key: 'default', label: 'Default', color: 'linear-gradient(135deg, rgb(79,70,229), rgb(168,85,247))' },
  { key: 'purple', label: 'Purple', color: 'linear-gradient(135deg, rgb(126,34,206), rgb(217,70,239))' },
  { key: 'blue', label: 'Blue', color: 'linear-gradient(135deg, rgb(37,99,235), rgb(6,182,212))' },
  { key: 'gray', label: 'Gray', color: 'linear-gradient(135deg, rgb(71,85,105), rgb(100,116,139))' },
  { key: 'green', label: 'Green', color: 'linear-gradient(135deg, rgb(5,150,105), rgb(20,184,166))' },
  { key: 'red', label: 'Red', color: 'linear-gradient(135deg, rgb(220,38,38), rgb(236,72,153))' },
  { key: 'dark', label: 'Dark', color: 'linear-gradient(135deg, rgb(30,32,40), rgb(56,189,248))' },
];

const open = ref(false);

const changeTheme = (key: string) => {
  document.body.className = key;
  localStorage.setItem('theme', key);
  currentTheme.value = key;
  open.value = false;
}

onMounted(() => {
  if (currentTheme.value) {
    document.body.className = currentTheme.value;
  }
});
</script>


<template>
<a-popover trigger="click" placement="bottom" v-model:open="open" overlayClassName="theme-popover">
  <button class="theme-trigger" :class="'theme-trigger--' + variant" aria-label="Farbschema wählen" title="Farbschema wählen">
    <BgColorsOutlined :style="{fontSize: '18px'}"/>
  </button>
  <template #content>
    <div class="theme-swatches">
      <button
          v-for="theme in themes"
          :key="theme.key"
          class="swatch"
          :class="{active: currentTheme === theme.key}"
          :style="{backgroundImage: theme.color}"
          :title="theme.label"
          @click="changeTheme(theme.key)"
      >
        <span class="visually-hidden">{{ theme.label }}</span>
      </button>
    </div>
  </template>
</a-popover>
</template>

<style scoped>
.theme-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background .2s ease, transform .2s ease, border-color .2s ease;
}
.theme-trigger--bar {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}
.theme-trigger--bar:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: #ffffff;
  transform: translateY(-1px);
}
.theme-trigger--surface {
  border: 1px solid var(--surface-border);
  background: var(--theme-container-color);
  color: var(--text-color);
  box-shadow: var(--shadow-sm);
}
.theme-trigger--surface:hover {
  background: rgba(var(--lingrad-a), 0.14);
  border-color: rgba(var(--lingrad-a), 0.4);
  transform: translateY(-1px);
}

.theme-swatches {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .6rem;
  padding: .2rem;
}
.swatch {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 999px;
  border: 2px solid transparent;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: transform .15s ease, border-color .15s ease;
}
.swatch:hover {
  transform: scale(1.1);
}
.swatch.active {
  border-color: var(--text-color);
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
