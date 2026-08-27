import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/common.json';
import hi from './locales/hi/common.json';
import ta from './locales/ta/common.json';
import te from './locales/te/common.json';
import kn from './locales/kn/common.json';
import ml from './locales/ml/common.json';

const resources = {
  en: { common: en },
  hi: { common: hi },
  ta: { common: ta },
  te: { common: te },
  kn: { common: kn },
  ml: { common: ml },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'ta',
    ns: ['common'],
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
