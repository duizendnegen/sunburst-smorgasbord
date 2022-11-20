import { useState } from "react";
import { useTranslation } from "react-i18next";
import Flavour from "../../interfaces";

interface AddFlavourFormProps {
  onAdd: (name: string, parentUuid: string) => void;
  hierarchicalFlavours: d3.HierarchyNode<Flavour>;
}

const AddFlavourForm = ({ onAdd, hierarchicalFlavours } : AddFlavourFormProps) => {
  const { t } = useTranslation();

  const [parentUuidToAddFlavourTo, setparentUuidToAddFlavourTo] = useState('');
  const [newFlavourName, setNewFlavourName] = useState('');
  
  const addNewFlavour = () => {
    onAdd(newFlavourName, parentUuidToAddFlavourTo);
    setparentUuidToAddFlavourTo('');
    setNewFlavourName('');
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
        <label className="label">Parent element</label>
        <div className="control">
          <div className="select">
            <select value={parentUuidToAddFlavourTo} onChange={(e) => setparentUuidToAddFlavourTo(e.target.value)}>
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
        <label className="label">New flavour name</label>
        <div className="control">
          <input
            className="input is-primary"
            type="text"
            placeholder="New flavour"
            onChange={(e) => setNewFlavourName(e.target.value)}
            value={newFlavourName}></input>
        </div>
      </div>
      
      <div className="field">
        <div className="control">
          <button
            className="button"
            onClick={addNewFlavour}
            disabled={parentUuidToAddFlavourTo === '' || newFlavourName === ''}>
            Add as a child
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddFlavourForm;
