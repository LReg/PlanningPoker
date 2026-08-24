import { ref, watch } from "vue";
import type { Ref } from "vue";

const chatCollapsed: Ref<boolean> = ref(localStorage.getItem('chatCollapsed') === 'true');

watch(chatCollapsed, (value) => {
  localStorage.setItem('chatCollapsed', String(value));
});

export default chatCollapsed;
