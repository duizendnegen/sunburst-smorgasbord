import saveAs from "file-saver";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import flavoursState from "../../states/flavours.atom";
import { exportMarkdown } from "../../markdown/exporter";

const ExportMarkdownButton = () : JSX.Element => {
  const { t } = useTranslation();
  const flavours = useRecoilValue(flavoursState);

  const exportCurrentFlavours = () : void => {
    let dataBlob = new Blob([exportMarkdown(flavours)], {type: "text/markdown;charset=utf-8"});
    saveAs(dataBlob, "sunburst-smorgasbord.md");
  }

  return (
    <button className="button is-primary" onClick={exportCurrentFlavours}>
      <strong>{t("button.export_markdown")}</strong>
    </button>
  );
}

export default ExportMarkdownButton;
