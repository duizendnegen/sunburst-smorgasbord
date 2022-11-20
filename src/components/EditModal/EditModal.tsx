import { v4 as uuidv4 } from 'uuid';
import Flavour from '../../interfaces';
import AddFlavourForm from '../AddFlavourForm/AddFlavourForm';
import RemoveFlavourForm from '../RemoveFlavourForm/RemoveFlavourForm';

interface EditModalProps {
  isActive: boolean;
  flavours: Flavour[];
  hierarchicalFlavours: d3.HierarchyNode<Flavour>;
  onClose: () => void;
  onChange: (data: Flavour[]) => void;
}

const EditModal = ({ isActive, flavours, hierarchicalFlavours, onClose, onChange } : EditModalProps) => {
  const addNewFlavour = (newFlavourName, parentUuidToAddFlavourTo) => {
    let flavour = {
      "uuid": uuidv4(),
      "parentUuid": parentUuidToAddFlavourTo, // TODO change this to parentUuid when pulling upstream changes
      "name": newFlavourName,
      "state":"NO"
    }
    
    onChange([flavour, ...flavours]);
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
          <p className="modal-card-title">Customize your Smorgasbord</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <h3 className="subtitle is-5">Add</h3>
          <AddFlavourForm
            hierarchicalFlavours={hierarchicalFlavours}
            onAdd={addNewFlavour}
          ></AddFlavourForm>
          <hr></hr>
          <h3 className="subtitle is-5">Remove</h3>
          <RemoveFlavourForm
            hierarchicalFlavours={hierarchicalFlavours}
            onRemove={removeFlavourAndDescendents}
          ></RemoveFlavourForm>
        </section>
        <footer className="modal-card-foot">
          <button className="button" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  )
}

export default EditModal;
