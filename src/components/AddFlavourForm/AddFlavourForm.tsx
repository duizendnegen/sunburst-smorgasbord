import { useState } from "react";
import * as d3 from "d3";
import Flavour from "../../interfaces";
import SelectFlavourControl from "../SelectFlavourControl/SelectFlavourControl";
import { useTranslation } from "react-i18next";


interface AddFlavourFormProps {
  onAdd: (name: string, parentUuid: string) => void;
  hierarchicalFlavours: d3.HierarchyNode<Flavour>;
}

const AddFlavourForm = ({ onAdd, hierarchicalFlavours } : AddFlavourFormProps) : JSX.Element => {
  const { t } = useTranslation();
  const [parentUuidToAddFlavourTo, setParentUuidToAddFlavourTo] = useState("");
  const [newFlavourName, setNewFlavourName] = useState("");
  const [buttonIsConfirmation, setButtonIsConfirmation] = useState(false);
  
  const addNewFlavour = () : void => {
    onAdd(newFlavourName, parentUuidToAddFlavourTo);
    setButtonIsConfirmation(true);
    setParentUuidToAddFlavourTo("");
    setNewFlavourName("");

    setTimeout(() : void => {
      setButtonIsConfirmation(false);
    }, 500);
  }

  return (
    <div>
      <div className="field">
        <label className="label" htmlFor="select-flavour">{t("edit.parent_element")}</label>
        <SelectFlavourControl
          value={parentUuidToAddFlavourTo}
          onChange={setParentUuidToAddFlavourTo}
          hierarchicalFlavours={hierarchicalFlavours ? hierarchicalFlavours
            .descendants() : []}></SelectFlavourControl>
      </div>
      <div className="field">
        <label className="label" htmlFor="input-new-flavour-name">{t("edit.new_flavour_name")}</label>
        <div className="control">
          <input
            id="input-new-flavour-name"
            className="input"
            type="text"
            placeholder={t("edit.new_flavour")}
            onChange={(e) : void => setNewFlavourName(e.target.value)}
            value={newFlavourName}></input>
        </div>
      </div>
      
      <div className="field">
        <div className="control">
          <button
            className={ buttonIsConfirmation ? "button is-primary is-confirmation" : "button is-primary" }
            onClick={addNewFlavour}
            disabled={parentUuidToAddFlavourTo === "" || newFlavourName === ""}>
            {t("edit.add_as_child")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddFlavourForm;
