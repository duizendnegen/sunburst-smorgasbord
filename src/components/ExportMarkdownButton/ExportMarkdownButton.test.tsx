import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { RecoilRoot, useSetRecoilState } from "recoil";
import ExportMarkdownButton from "./ExportMarkdownButton";
import saveAs from "file-saver";
import flavoursState from "../../states/flavours.atom";
import i18n from "../../i18n.tests";

// The app's i18n instance loads its locales over http, which does not work in
// the test environment; use the file-based test instance instead.
jest.mock("../../i18n", () => require("../../i18n.tests"));
jest.mock("file-saver", () => jest.fn());

const board = [
  { uuid: "root", parentUuid: "", name: "Our relationship includes...", key: "our_relationship_includes" },
  { uuid: "kink", parentUuid: "root", name: "Kink", key: "kink", state: "MAYBE" },
  { uuid: "body_contact", parentUuid: "kink", name: "Body contact", key: "body_contact", state: "YES" }
];

// Seeds the flavours atom before the button renders.
const SeedFlavours = ({ flavours }) : JSX.Element => {
  const setFlavours = useSetRecoilState(flavoursState);

  useEffect(() : void => {
    setFlavours(flavours);
  }, [ flavours ]);

  return null;
};

describe("ExportMarkdownButton", () => {
  beforeEach(() : void => {
    (saveAs as unknown as jest.Mock).mockClear();
  });

  it("renders the export button", () => {
    render(
      <RecoilRoot>
        <I18nextProvider i18n={i18n}>
          <ExportMarkdownButton />
        </I18nextProvider>
      </RecoilRoot>);

    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("downloads the board as a markdown file", async () => {
    render(
      <RecoilRoot>
        <I18nextProvider i18n={i18n}>
          <SeedFlavours flavours={board} />
          <ExportMarkdownButton />
        </I18nextProvider>
      </RecoilRoot>);

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(saveAs).toHaveBeenCalledTimes(1);
    const [ blob, fileName ] = (saveAs as unknown as jest.Mock).mock.calls[0];
    expect(fileName).toBe("sunburst-smorgasbord.md");
    expect(blob.type).toBe("text/markdown;charset=utf-8");

    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () : void => { resolve(reader.result as string); };
      reader.readAsText(blob);
    });
    expect(text).toContain("# Sunburst Smorgasbord - English");
    expect(text).toContain("## Kink (MAYBE)");
    expect(text).toContain("- Body contact (YES)");
  });
});
