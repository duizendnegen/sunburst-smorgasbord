import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSetRecoilState } from "recoil";
import flavoursState from "../../states/flavours.atom";

const ImportJsonButton = () : JSX.Element => {
  const { t } = useTranslation();
  const setFlavours = useSetRecoilState(flavoursState);

  const inputFile = useRef(null);

  const importNewFlavours = () : void => {
    inputFile.current.click();
  }

  const handleFileSubmission = (event) : void => {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = handleReaderOnLoad;
    reader.readAsText(file, "UTF-8");
  }

  const handleReaderOnLoad = (evt) : void => {
    let json = JSON.parse(evt.target.result as any);
    setFlavours(json);
  }

  return (
    <button className="button is-primary" onClick={importNewFlavours}>
      <strong>{t("button.import_json")}</strong>
      <input
        type='file'
        ref={inputFile}
        onChange={handleFileSubmission}
        style={{display: "none"}}
        accept="application/json"/>
    </button>
  )
};

export default ImportJsonButton;
