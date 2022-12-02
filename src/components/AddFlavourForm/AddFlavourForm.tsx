import { useState } from "react";
import Flavour from "../../interfaces";
import SelectFlavourControl from "../SelectFlavourControl/SelectFlavourControl";

interface AddFlavourFormProps {
  onAdd: (name: string, parentUuid: string) => void;
  hierarchicalFlavours: d3.HierarchyNode<Flavour>;
}

const AddFlavourForm = ({ onAdd, hierarchicalFlavours } : AddFlavourFormProps) => {
  const [parentUuidToAddFlavourTo, setParentUuidToAddFlavourTo] = useState('');
  const [newFlavourName, setNewFlavourName] = useState('');
  
  const addNewFlavour = () => {
    onAdd(newFlavourName, parentUuidToAddFlavourTo);
    setParentUuidToAddFlavourTo('');
    setNewFlavourName('');
  }

  return (
    <div>
      <div className="field">
        <label className="label">Parent element</label>
        <SelectFlavourControl
          value={parentUuidToAddFlavourTo}
          onChange={setParentUuidToAddFlavourTo}
          hierarchicalFlavours={hierarchicalFlavours ? hierarchicalFlavours
            .descendants() : []}></SelectFlavourControl>
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
