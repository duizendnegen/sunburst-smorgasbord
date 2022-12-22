import { v4 as uuidv4 } from "uuid";
import AddFlavourForm from "../AddFlavourForm/AddFlavourForm";
import RemoveFlavourForm from "../RemoveFlavourForm/RemoveFlavourForm";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";
import flavoursState from "../../states/flavours.atom";
import hierarchicalFlavoursState from "../../states/hierarchicalFlavours.selector";
import Flavour from "../../interfaces";
import { findAllDescendants } from "../../helpers";

interface EditModalProps {
  isActive: boolean;
  onClose: () => void;
}

const EditModal = ({ isActive, onClose } : EditModalProps) : JSX.Element => {
  const { t } = useTranslation();
  const [flavours, setFlavours] = useRecoilState(flavoursState);
  const hierarchicalFlavours = useRecoilValue(hierarchicalFlavoursState);
  
  const addNewFlavour = (newFlavourName, parentUuidToAddFlavourTo) : void => {
    let flavour = {
      "uuid": uuidv4(),
      "parentUuid": parentUuidToAddFlavourTo,
      "name": newFlavourName,
      "state":"YES"
    }

    let parentHierarchicalFlavour = hierarchicalFlavours.find(hf => hf.data.uuid === parentUuidToAddFlavourTo);
    
    setFlavours([flavour, ...flavours.map((f) : Flavour => {
      // change the flavour to be selected when the newly added flavour is a child flavour of it
      let hierarchicalFlavour = hierarchicalFlavours.find(hf => hf.data.uuid === f.uuid);

      if (parentHierarchicalFlavour.ancestors().map(af => af.data.uuid).includes(hierarchicalFlavour.data.uuid)) {
        return {
          ...f,
          state: "YES"
        };
      }

      return f;
    })]);
  }

  const removeFlavourAndDescendents = (flavourUuid) : void => {
    let flavourUuidsToRemove = [ flavourUuid, ...findAllDescendants(flavours, flavourUuid) ];
    setFlavours(flavours.filter(flavour => !flavourUuidsToRemove.includes(flavour.uuid)));
  }

  return (
    <div className={isActive ? "modal is-active" : "modal"}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{t("edit.customize")}</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <h3 className="subtitle is-5">{t("edit.add")}</h3>
          <AddFlavourForm
            hierarchicalFlavours={hierarchicalFlavours}
            onAdd={addNewFlavour}
          ></AddFlavourForm>
          <hr></hr>
          <h3 className="subtitle is-5">{t("edit.remove")}</h3>
          <RemoveFlavourForm
            hierarchicalFlavours={hierarchicalFlavours}
            onRemove={removeFlavourAndDescendents}
          ></RemoveFlavourForm>
        </section>
        <footer className="modal-card-foot">
          <button className="button" onClick={onClose}>{t("edit.close")}</button>
        </footer>
      </div>
    </div>
  )
}

export default EditModal;
