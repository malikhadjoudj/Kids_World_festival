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

// Applique la direction du texte (RTL pour l'arabe) et la langue au <html>
const applyDirection = (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
};

applyDirection(savedLang);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
  applyDirection(lng);
});

export default i18n;