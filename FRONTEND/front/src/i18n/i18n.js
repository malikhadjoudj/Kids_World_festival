import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

const savedLang = localStorage.getItem('lang') || 'fr';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

// On ne change JAMAIS la direction visuelle (toujours LTR), même en arabe —
// seul le texte est traduit, la mise en page reste identique.
const applyLanguage = (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = 'ltr';
};

applyLanguage(savedLang);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
  applyLanguage(lng);
});

export default i18n;