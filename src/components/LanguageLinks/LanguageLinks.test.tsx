import { act, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import LanguageLinks from "./LanguageLinks";
import i18n from "../../i18n.tests";

const renderLinks = () : void => {
  render(
    <I18nextProvider i18n={i18n}>
      <LanguageLinks />
    </I18nextProvider>);
};

describe("LanguageLinks", () => {
  afterEach(async () => {
    // Still mounted here, so the language change re-renders the links.
    await act(async () => { await i18n.changeLanguage("en"); });
  });

  it("names every language in that language, whatever the active language", async () => {
    await i18n.changeLanguage("de");
    renderLinks();

    expect(screen.getAllByRole("button").map(button => button.textContent))
      .toEqual(["English", "Español", "Deutsch", "Nederlands"]);
  });

  it("marks each link with its language", () => {
    renderLinks();

    expect(screen.getByRole("button", { name: "Nederlands" })).toHaveAttribute("lang", "nl");
  });

  it("switches the language", () => {
    renderLinks();

    fireEvent.click(screen.getByRole("button", { name: "Español" }));

    expect(i18n.language).toBe("es");
  });
});
