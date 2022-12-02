import { useState } from "react";
import Flavour from "../../interfaces";
import SelectFlavourControl from "../SelectFlavourControl/SelectFlavourControl";

interface RemoveFlavourFormProps {
  onRemove: (uuid: string) => void;
  hierarchicalFlavours: d3.HierarchyNode<Flavour>;
}

const RemoveFlavourForm = ({ onRemove, hierarchicalFlavours } : RemoveFlavourFormProps) => {
  const [flavourToRemove, setFlavourToRemove] = useState('');

  const removeFlavour = () => {
    onRemove(flavourToRemove);
    setFlavourToRemove('');
  }

  return (
    <div>
      <div className="field">
        <label className="label">Flavour to remove</label>
        <SelectFlavourControl
          value={flavourToRemove}
          onChange={setFlavourToRemove}
          hierarchicalFlavours={hierarchicalFlavours ? hierarchicalFlavours
            .descendants()
            .filter((flavour) => flavour.parent): []}></SelectFlavourControl>
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
