import { i18n as I18n } from "i18next";

// Keeps <html lang> in line with the active language, so screen readers and
// browsers (hyphenation, translation offers) treat the page as that language.
// Register before i18n.init() so the detected language is applied as well.
export const syncDocumentLanguage = (i18n: I18n) : void => {
  i18n.on("languageChanged", (lng: string) : void => {
    document.documentElement.lang = lng;
  });
};
