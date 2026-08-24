import { ref, watch } from "vue";
import type { Ref } from "vue";

export type PlayerViewMode = 'grid' | 'list';

const stored = localStorage.getItem('playerViewMode');
const playerViewMode: Ref<PlayerViewMode> = ref(stored === 'list' ? 'list' : 'grid');

watch(playerViewMode, (value) => {
  localStorage.setItem('playerViewMode', value);
});

export default playerViewMode;
