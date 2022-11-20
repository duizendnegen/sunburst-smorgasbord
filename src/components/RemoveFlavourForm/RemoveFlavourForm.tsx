import { useState } from "react";
import { useTranslation } from "react-i18next";
import Flavour from "../../interfaces";

interface RemoveFlavourFormProps {
  onRemove: (uuid: string) => void;
  flavours: Flavour[];
}

const RemoveFlavourForm = ({ onRemove, flavours } : RemoveFlavourFormProps) => {
  const { t } = useTranslation();

  const [flavourToRemove, setFlavourToRemove] = useState('');

  const removeFlavour = () => {
    onRemove(flavourToRemove);
    setFlavourToRemove('');
  }

  return (
    <div>
      <div className="field">
        <label className="label">Flavour to remove</label>
        <div className="control">
          <div className="select">
          <select value={flavourToRemove} onChange={(e) => setFlavourToRemove(e.target.value)}>
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
