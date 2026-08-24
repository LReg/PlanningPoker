import { ref } from 'vue';

export const themeAccents: Record<string, string> = {
  default: '#4F46E5',
  purple: '#7E22CE',
  blue: '#2563EB',
  gray: '#475569',
  green: '#059669',
  red: '#DC2626',
  dark: '#6366F1',
};

const currentTheme = ref(localStorage.getItem('theme') || 'default');

export default currentTheme;
