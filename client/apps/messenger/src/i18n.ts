import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslation from "./public/locales/en/translation.json";
import hrTranslation from "./public/locales/hr/translation.json";


i18n.use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "hr",
        debug: false,
        supportedLngs: ["en", "hr"],
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: enTranslation,
            },
            hr: {
                translation: hrTranslation,
            }
        },
    });

export default i18n;
