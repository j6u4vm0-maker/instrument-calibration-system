import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-TW',
    fallbackLng: 'en-US',
    ns: ['common', 'calibration', 'quality'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    // Using dot as namespace separator to support 'common.nav.dashboard'
    nsSeparator: '.',
    keySeparator: '.',
    react: {
      useSuspense: false,
    },
  });

export default i18n;
