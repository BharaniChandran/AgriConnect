import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import mr from './locales/mr/common.json';
import hi from './locales/hi/common.json';
import en from './locales/en/common.json';
import gu from './locales/gu/common.json';
import ta from './locales/ta/common.json';
import te from './locales/te/common.json';
import kn from './locales/kn/common.json';
import ml from './locales/ml/common.json';

const resources = {
  mr: { common: mr },
  hi: { common: hi },
  en: { common: en },
  gu: { common: gu },
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
    lng: localStorage.getItem('i18nextLng') || 'mr',
    ns: ['common'],
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
