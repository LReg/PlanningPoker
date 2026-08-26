import { watch } from "vue";
import type { Ref } from "vue";
import i18n from "@/i18n";
import type { Locale } from "@/i18n";

const language = i18n.global.locale as Ref<Locale>;

watch(language, (value) => {
  localStorage.setItem('language', value);
});

export default language;
