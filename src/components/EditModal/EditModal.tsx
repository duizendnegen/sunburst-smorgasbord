import { v4 as uuidv4 } from 'uuid';
import Flavour from '../../interfaces';
import AddFlavourForm from '../AddFlavourForm/AddFlavourForm';
import RemoveFlavourForm from '../RemoveFlavourForm/RemoveFlavourForm';
import { useTranslation } from "react-i18next";

interface EditModalProps {
  isActive: boolean;
  flavours: Flavour[];
  hierarchicalFlavours: d3.HierarchyNode<Flavour>;
  onClose: () => void;
  onChange: (data: Flavour[]) => void;
}

const EditModal = ({ isActive, flavours, hierarchicalFlavours, onClose, onChange } : EditModalProps) => {
  const { t } = useTranslation();
  
  const addNewFlavour = (newFlavourName, parentUuidToAddFlavourTo) => {
    let flavour = {
      "uuid": uuidv4(),
      "parentUuid": parentUuidToAddFlavourTo,
      "name": newFlavourName,
      "state":"YES"
    }

    let parentHierarchicalFlavour = hierarchicalFlavours.find(hf => hf.data.uuid === parentUuidToAddFlavourTo);
    
    onChange([flavour, ...flavours.map(f => {
      // change the flavour to be selected when the newly added flavour is a child flavour of it
      let hierarchicalFlavour = hierarchicalFlavours.find(hf => hf.data.uuid === f.uuid);

      if (parentHierarchicalFlavour.ancestors().map(af => af.data.uuid).includes(hierarchicalFlavour.data.uuid)) {
        f.state = 'YES';
      }

      return f;
    })]);
  }

  const removeFlavourAndDescendents = (flavourUuid) => {
    let flavourUuidsToRemove = [ flavourUuid, ...findAllDescendants(flavourUuid) ];
    console.log(flavourUuidsToRemove);
    onChange(flavours.filter(flavour => !flavourUuidsToRemove.includes(flavour.uuid)));
  }

  const findAllDescendants = (flavourUuid) => {
    let children = flavours
      .filter(flavour => flavour.parentUuid === flavourUuid)
      .map(flavour => flavour.uuid);

    let descendants = children.flatMap(uuid => findAllDescendants(uuid));

    return children.concat(descendants);
  }

  return (
    <div className={isActive ? 'modal is-active' : 'modal'}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{t('edit.customize')}</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <h3 className="subtitle is-5">{t('edit.add')}</h3>
          <AddFlavourForm
            hierarchicalFlavours={hierarchicalFlavours}
            onAdd={addNewFlavour}
          ></AddFlavourForm>
          <hr></hr>
          <h3 className="subtitle is-5">{t('edit.remove')}</h3>
          <RemoveFlavourForm
            hierarchicalFlavours={hierarchicalFlavours}
            onRemove={removeFlavourAndDescendents}
          ></RemoveFlavourForm>
        </section>
        <footer className="modal-card-foot">
          <button className="button" onClick={onClose}>{t('edit.close')}</button>
        </footer>
      </div>
    </div>
  )
}

export default EditModal;
