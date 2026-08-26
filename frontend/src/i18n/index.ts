import { createI18n } from 'vue-i18n';
import de from './locales/de';
import en from './locales/en';

export type Locale = 'de' | 'en';

function detectLocale(): Locale {
  const stored = localStorage.getItem('language');
  if (stored === 'de' || stored === 'en') {
    return stored;
  }
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'de';
}

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'de',
  messages: { de, en },
});

export default i18n;
