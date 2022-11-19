import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface EditModalProps {
  isActive: boolean;
  flavours: any; // TODO better type
  onClose: () => void;
  onChange: (data: any) => void; // TODO better parameter type
}

const EditModal = ({ isActive, flavours, onClose, onChange } : EditModalProps) => {
  // TODO think about good way of initializing the values (first element from flavours? Default empty and disable adding when nothing is selected?)
  const [parentIdToAddFlavourTo, setParentIdToAddFlavourTo] = useState('');
  const [newFlavourName, setNewFlavourName] = useState('');
  const [flavourToRemove, setFlavourToRemove] = useState(''); // TODO implement the relevant logic including removing all descendants

  const addNewFlavour = () => {
    let flavour = {
      "uuid": uuidv4(),
      "parentId": parentIdToAddFlavourTo, // TODO change this to parentUuid when pulling upstream changes
      "name": newFlavourName,
      "value": 1000, // TODO gotta do some magic here, have to start to dynamically calculate the vaule instead...
      "state":"NO"
    }
    
    onChange([ flavour, ... flavours]);

    setParentIdToAddFlavourTo('');
    setNewFlavourName('');
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
          <div className="field">
            <label className="label">Parent element</label>
            <div className="control">
              <div className="select">
                <select value={parentIdToAddFlavourTo} onChange={(e) => setParentIdToAddFlavourTo(e.target.value)}>
                  <option value=''></option>
                  {flavours.map((flavour) => (
                    <option value={flavour.uuid} key={flavour.uuid}>
                      {flavour.name}
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
              <button className="button" onClick={addNewFlavour}>
                Add as a child
              </button>
            </div>
          </div>
          <hr></hr>
          <h3 className="subtitle is-5">Remove</h3>
          <div className="field">
            <label className="label">Parent element</label>
            <div className="control">
              <div className="select">
                <select>
                  <option value=''></option>
                  {flavours.map((flavour) => (
                    <option value={flavour.uuid} key={flavour.uuid}>
                      {flavour.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button className="button">
                Remove flavour &amp; all descendants
              </button>
            </div>
          </div>
        </section>
        <footer className="modal-card-foot">
          <button className="button" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  )
}

export default EditModal;
