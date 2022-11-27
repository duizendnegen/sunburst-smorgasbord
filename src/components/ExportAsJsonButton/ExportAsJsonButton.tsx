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
    <div className="button-trigger" onClick={exportCurrentFlavours}>
      <strong>{t('button.download_json')}</strong>
    </div>
  );
}

export default ExportAsJsonButton;
