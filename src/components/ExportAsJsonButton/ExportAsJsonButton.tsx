import saveAs from "file-saver";

interface ExportAsJsonButtonProps {
  flavours: any
}

const ExportAsJsonButton = ({ flavours } : ExportAsJsonButtonProps) => {
  const exportCurrentFlavours = () => {
    let dataBlob = new Blob([JSON.stringify(flavours)], {type: "application/json;charset=utf-8"});
    saveAs(dataBlob, 'sunburst-smorgasbord.json');
  }

  return (
    <div className="button-trigger" onClick={exportCurrentFlavours}>
      <strong>Export</strong>
    </div>
  );
}

export default ExportAsJsonButton;
