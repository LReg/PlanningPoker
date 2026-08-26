<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import languageRef from "@/reactive/useLanguage";
import type { Locale } from "@/i18n";

withDefaults(defineProps<{variant?: 'bar' | 'surface'}>(), {variant: 'bar'});
const { t } = useI18n();

const setLanguage = (locale: Locale) => {
  languageRef.value = locale;
}
</script>

<template>
  <div class="lang-switch" :class="'lang-switch--' + variant" :aria-label="t('languageSwitch.label')" :title="t('languageSwitch.label')">
    <button
        class="lang-option"
        :class="{active: languageRef === 'de'}"
        @click="setLanguage('de')"
    >DE</button>
    <button
        class="lang-option"
        :class="{active: languageRef === 'en'}"
        @click="setLanguage('en')"
    >EN</button>
  </div>
</template>

<style scoped>
.lang-switch {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: .2rem;
  gap: .1rem;
}
.lang-switch--bar {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.14);
}
.lang-switch--surface {
  border: 1px solid var(--surface-border);
  background: var(--theme-container-color);
  box-shadow: var(--shadow-sm);
}
.lang-option {
  border: none;
  background: transparent;
  border-radius: 999px;
  padding: .3rem .6rem;
  font-size: .75em;
  font-weight: 700;
  letter-spacing: .02em;
  cursor: pointer;
  color: inherit;
  opacity: .65;
  transition: background .2s ease, opacity .2s ease;
}
.lang-switch--bar .lang-option {
  color: #ffffff;
}
.lang-switch--surface .lang-option {
  color: var(--text-color);
}
.lang-option:hover {
  opacity: 1;
}
.lang-switch--bar .lang-option.active {
  background: rgba(255, 255, 255, 0.32);
  opacity: 1;
}
.lang-switch--surface .lang-option.active {
  background-image: linear-gradient(105deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  color: #ffffff;
  opacity: 1;
}
</style>
