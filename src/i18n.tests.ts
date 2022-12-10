import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-fs-backend';
import { lstatSync, readdirSync } from 'fs';
import { join } from 'path';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    initImmediate: false,
    lng: 'en',
    preload: readdirSync(join(__dirname, '../public/locales')).filter((fileName) => {
      const joinedPath = join(join(__dirname, '../public/locales'), fileName)
      const isDirectory = lstatSync(joinedPath).isDirectory()
      return isDirectory
    }),
    backend: {
      loadPath: join(__dirname, '../public/locales/{{lng}}/{{ns}}.json')
    },
    react: {
      useSuspense: false
    }
  });


export default i18n;