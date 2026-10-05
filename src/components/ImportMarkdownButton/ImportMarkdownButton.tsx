import { useRef, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSetRecoilState } from "recoil";
import flavoursState from "../../states/flavours.atom";
import Flavour from "../../interfaces";
import { importMarkdown } from "../../markdown/importer";

/**
 * DEPRECATED: legacy JSON import for old .json exports.
 * Export is markdown-only now. Remove this function, the JSON branch in
 * handleReaderOnLoad and the .json entries in `accept` when it's due.
 */
const importJson = (text: string): Flavour[] => {
  const json = JSON.parse(text);
  if (!Array.isArray(json)) throw new Error("Invalid JSON board");
  return json;
}

// Heuristic: a markdown export starts with "#", so anything starting with
// "[" or "{" (or a .json file) is treated as the legacy JSON format.
const looksLikeJson = (text: string, fileName?: string): boolean => {
  if (fileName?.toLowerCase().endsWith(".json")) return true;
  const first = text.trimStart()[0];
  return first === "[" || first === "{";
}

const ImportMarkdownButton = () : JSX.Element => {
  const { t } = useTranslation();
  const setFlavours = useSetRecoilState(flavoursState);

  const inputFile = useRef<HTMLInputElement>(null);
  // Name of the file currently being read (set before FileReader fires).
  const currentFile = useRef<File | null>(null);

  const importNewFlavours = () : void => {
    inputFile.current.click();
  }

  const handleFileSubmission = (event: ChangeEvent<HTMLInputElement>) : void => {
    event.stopPropagation();
    event.preventDefault();
    let file = event.target.files?.[0];
    if (!file) return;
    currentFile.current = file;

    let reader = new FileReader();
    reader.onload = handleReaderOnLoad;
    reader.readAsText(file, "UTF-8");
  }

  const handleReaderOnLoad = (evt: ProgressEvent<FileReader>) : void => {
    try {
      const text = evt.target.result as string;
      // DEPRECATED: JSON fallback.
      setFlavours(looksLikeJson(text, currentFile.current?.name) ? importJson(text) : importMarkdown(text));
    } catch (error) {
      console.error("Could not import markdown board:", error);
      window.alert(t("import.error"));
    }
  }

  return (
    <button className="button is-primary" onClick={importNewFlavours}>
      <strong>{t("button.import_markdown")}</strong>
      <input
        type='file'
        ref={inputFile}
        onChange={handleFileSubmission}
        style={{display: "none"}}
        // DEPRECATED: .json entries support legacy imports.
        accept=".md,.markdown,.json,text/markdown,text/x-markdown,application/json"/>
    </button>
  )
};

export default ImportMarkdownButton;
