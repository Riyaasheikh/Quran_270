import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources } from './translations';

export const RTL_LANGUAGES = ['ar', 'ur', 'fa'];

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', dir: 'ltr' },
  { code: 'fr', name: 'French', native: 'Français', dir: 'ltr' },
  { code: 'ru', name: 'Russian', native: 'Русский', dir: 'ltr' }
];

export const setDocumentDirection = (langCode = 'en') => {
  const baseCode = (langCode || 'en').split('-')[0].toLowerCase();
  const isRTL = RTL_LANGUAGES.includes(baseCode);
  const dir = isRTL ? 'rtl' : 'ltr';

  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', baseCode);

  if (isRTL) {
    document.documentElement.classList.add('is-rtl');
  } else {
    document.documentElement.classList.remove('is-rtl');
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    load: 'languageOnly',
    supportedLngs: LANGUAGES.map(l => l.code),
    nonExplicitSupportedLngs: true,
    resources,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'deen360_lang'
    }
  });

setDocumentDirection(i18n.resolvedLanguage || i18n.language || 'en');

i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});

export default i18n;