import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { RecoilRoot, useRecoilValue } from "recoil";
import ImportMarkdownButton from "./ImportMarkdownButton";
import { importMarkdown } from "../../markdown/importer";
import flavoursState from "../../states/flavours.atom";
import i18n from "../../i18n.tests";

// The importer is mocked so the failure path can be exercised deterministically;
// its own behavior is covered in src/markdown/markdown.test.tsx.
jest.mock("../../markdown/importer", () => ({
  importMarkdown: jest.fn()
}));

const importedFlavours = [
  { uuid: "root", parentUuid: "", name: "Our relationship includes...", key: "our_relationship_includes" },
  { uuid: "kink", parentUuid: "root", name: "Kink", state: "MAYBE" }
];

// Renders the current flavours atom so state updates can be asserted.
const Probe = () : JSX.Element => {
  const flavours = useRecoilValue(flavoursState);
  return <div data-testid="probe">{JSON.stringify(flavours)}</div>;
};

const renderButton = () : void => {
  render(
    <RecoilRoot>
      <I18nextProvider i18n={i18n}>
        <ImportMarkdownButton />
        <Probe />
      </I18nextProvider>
    </RecoilRoot>);
};

const fileInput = () : HTMLInputElement => {
  return document.querySelector("input[type='file']") as HTMLInputElement;
};

beforeEach(() : void => {
  (importMarkdown as jest.Mock).mockReset();
});

afterEach(() : void => {
  jest.restoreAllMocks();
});

describe("ImportMarkdownButton", () => {
  it("renders the import button with a hidden file input", () => {
    renderButton();

    expect(screen.getByRole("button", { name: "Import" })).toBeInTheDocument();
    expect(fileInput()).toHaveAttribute("accept", ".md,.markdown,text/markdown,text/x-markdown,.json,application/json");
  });

  it("opens the file picker when clicked", () => {
    renderButton();

    const clickSpy = jest.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() : void => {});
    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("imports the board from the selected markdown file", async () => {
    (importMarkdown as jest.Mock).mockReturnValue(importedFlavours);
    renderButton();

    const file = new File(["# Sunburst Smorgasbord\n"], "board.md", { type: "text/markdown" });
    fireEvent.change(fileInput(), { target: { files: [file] } });

    await waitFor(() : void => {
      expect(importMarkdown).toHaveBeenCalledWith("# Sunburst Smorgasbord\n");
    });
    expect(JSON.parse(screen.getByTestId("probe").textContent)).toEqual(importedFlavours);
  });

  it("imports a legacy JSON board when the content looks like JSON", async () => {
    renderButton();

    const json = JSON.stringify(importedFlavours);
    const file = new File([json], "board.json", { type: "application/json" });
    fireEvent.change(fileInput(), { target: { files: [file] } });

    await waitFor(() : void => {
      expect(JSON.parse(screen.getByTestId("probe").textContent)).toEqual(importedFlavours);
    });
    // The markdown importer must not be used for JSON content.
    expect(importMarkdown).not.toHaveBeenCalled();
  });

  it("imports the same file again after an earlier import", async () => {
    (importMarkdown as jest.Mock).mockReturnValue(importedFlavours);
    renderButton();

    const content = "# Sunburst Smorgasbord\n";
    const file = new File([content], "board.md", { type: "text/markdown" });

    fireEvent.change(fileInput(), { target: { files: [file] } });
    await waitFor(() : void => {
      expect(importMarkdown).toHaveBeenCalledTimes(1);
    });

    // Re-selecting the same file must import again and overwrite state.
    const updated = [...importedFlavours, { uuid: "extra", parentUuid: "root", name: "Extra" }];
    (importMarkdown as jest.Mock).mockReturnValueOnce(updated);
    fireEvent.change(fileInput(), { target: { files: [file] } });

    await waitFor(() : void => {
      expect(importMarkdown).toHaveBeenCalledTimes(2);
    });
    expect(JSON.parse(screen.getByTestId("probe").textContent)).toEqual(updated);
  });

  it("ignores a change without a file", () => {
    (importMarkdown as jest.Mock).mockReturnValue(importedFlavours);
    renderButton();

    fireEvent.change(fileInput(), {});

    expect(importMarkdown).not.toHaveBeenCalled();
  });

  it("alerts when the file cannot be parsed", async () => {
    (importMarkdown as jest.Mock).mockImplementation(() : void => { throw new Error("unparseable"); });
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() : void => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() : void => {});

    renderButton();

    const file = new File(["not a board"], "board.md", { type: "text/markdown" });
    fireEvent.change(fileInput(), { target: { files: [file] } });

    await waitFor(() : void => {
      expect(alertSpy).toHaveBeenCalledWith("Could not read that file as a Sunburst Smorgasbord markdown export.");
    });
    expect(errorSpy).toHaveBeenCalled();
  });
});
