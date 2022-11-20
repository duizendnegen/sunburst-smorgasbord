import { useState } from "react";
import { useTranslation } from "react-i18next";
import Flavour from "../../interfaces";

interface AddFlavourFormProps {
  onAdd: (name: string, parentUuid: string) => void;
  flavours: Flavour[];
}

const AddFlavourForm = ({ onAdd, flavours } : AddFlavourFormProps) => {
  const { t } = useTranslation();

  const [parentUuidToAddFlavourTo, setparentUuidToAddFlavourTo] = useState('');
  const [newFlavourName, setNewFlavourName] = useState('');
  
  const addNewFlavour = () => {
    onAdd(newFlavourName, parentUuidToAddFlavourTo);
    setparentUuidToAddFlavourTo('');
    setNewFlavourName('');
  }

  return (
    <div>
      <div className="field">
        <label className="label">Parent element</label>
        <div className="control">
          <div className="select">
            <select value={parentUuidToAddFlavourTo} onChange={(e) => setparentUuidToAddFlavourTo(e.target.value)}>
              <option value=''></option>
              {flavours.map((flavour) => (
                <option value={flavour.uuid} key={flavour.uuid}>
                  { flavour.key ? t('flavours.' + flavour.key) : flavour.name }
                </option>
              ))}
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
