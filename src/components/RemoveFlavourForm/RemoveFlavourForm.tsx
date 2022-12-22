import { useState } from "react";
import Flavour from "../../interfaces";
import * as d3 from "d3";
import SelectFlavourControl from "../SelectFlavourControl/SelectFlavourControl";
import { useTranslation } from "react-i18next";


interface RemoveFlavourFormProps {
  onRemove: (uuid: string) => void;
  hierarchicalFlavours: d3.HierarchyNode<Flavour>;
}

const RemoveFlavourForm = ({ onRemove, hierarchicalFlavours } : RemoveFlavourFormProps) : JSX.Element => {
  const { t } = useTranslation();
  const [flavourToRemove, setFlavourToRemove] = useState("");

  const removeFlavour = () : void => {
    onRemove(flavourToRemove);
    setFlavourToRemove("");
  }

  return (
    <div>
      <div className="field">
        <label className="label" htmlFor="select-flavour">{t("edit.remove_flavour")}</label>
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
            className='button is-primary'
            onClick={removeFlavour}
            disabled={flavourToRemove === ""}>
            {t("edit.remove_flavour_button")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RemoveFlavourForm;
