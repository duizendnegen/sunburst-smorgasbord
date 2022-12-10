import saveAs from "file-saver";
import { useTranslation } from "react-i18next";

interface ExportAsJsonButtonProps {
  flavours: any
}

const ExportAsJsonButton = ({ flavours } : ExportAsJsonButtonProps) => {
  const { t } = useTranslation();

  const exportCurrentFlavours = () => {
    let dataBlob = new Blob([JSON.stringify(flavours)], {type: "application/json;charset=utf-8"});
    saveAs(dataBlob, 'sunburst-smorgasbord.json');
  }

  return (
    <button className="button is-primary" onClick={exportCurrentFlavours}>
      <strong>{t('button.download_json')}</strong>
    </button>
  );
}

export default ExportAsJsonButton;
