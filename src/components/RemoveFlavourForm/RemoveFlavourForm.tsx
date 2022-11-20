import { useState } from "react";
import { useTranslation } from "react-i18next";
import Flavour from "../../interfaces";

interface RemoveFlavourFormProps {
  onRemove: (uuid: string) => void;
  hierarchicalFlavours: d3.HierarchyNode<Flavour>;
}

const RemoveFlavourForm = ({ onRemove, hierarchicalFlavours } : RemoveFlavourFormProps) => {
  const { t } = useTranslation();

  const [flavourToRemove, setFlavourToRemove] = useState('');

  const removeFlavour = () => {
    onRemove(flavourToRemove);
    setFlavourToRemove('');
  }

  const getLabelForFlavour = (flavour: d3.HierarchyNode<Flavour>) => {
    if(!flavour.parent) {
      return flavour.data.key ? t(`flavours.${flavour.data.key}`) : flavour.data.name;
    }

    return flavour
      .ancestors()
      .reverse()
      .slice(1)
      .map((ancestor) => ancestor.data.key ? t(`flavours.${ancestor.data.key}`) : ancestor.data.name).join(" > ");
  }

  return (
    <div>
      <div className="field">
        <label className="label">Flavour to remove</label>
        <div className="control">
          <div className="select">
          <select value={flavourToRemove} onChange={(e) => setFlavourToRemove(e.target.value)}>
              <option value=''></option>
              {hierarchicalFlavours ? hierarchicalFlavours.descendants().map((flavour) => (
                <option value={flavour.data.uuid} key={flavour.data.uuid}>
                  {getLabelForFlavour(flavour)}
                </option>
              )) : ''}
            </select>
          </div>
        </div>
      </div>
      <div className="field">
        <div className="control">
          <button
            className='button'
            onClick={removeFlavour}
            disabled={flavourToRemove === ''}>
            Remove flavour &amp; all descendants
          </button>
        </div>
      </div>
    </div>
  )
}

export default RemoveFlavourForm;
