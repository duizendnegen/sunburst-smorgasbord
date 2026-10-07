import i18next from "i18next";
import { syncDocumentLanguage } from "./documentLanguage";

describe("syncDocumentLanguage", () => {
  afterEach(() => {
    document.documentElement.lang = "en";
  });

  it("applies the initial language and every later change", async () => {
    const i18n = i18next.createInstance();
    syncDocumentLanguage(i18n);

    await i18n.init({ lng: "nl", resources: {} });
    expect(document.documentElement.lang).toBe("nl");

    await i18n.changeLanguage("de");
    expect(document.documentElement.lang).toBe("de");
  });
});
