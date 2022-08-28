import { useEffect, useState } from 'react';
import './App.css';
import * as d3 from "d3";

import Smorgasbord from './components/Smorgasbord/Smorgasbord';
import Flavour from './interfaces';
import ImportJsonButton from './components/ImportJsonButton/ImportJsonButton';
import ExportAsJsonButton from './components/ExportAsJsonButton/ExportAsJsonButton';
import ExportAsImageButton from './components/ExportAsImageButton/ExportAsImageButton';

const App = () => {
  const [flavours, setFlavours] = useState([]);
  const [hierchicalFlavours, setHierarchicalFlavours] = useState<d3.HierarchyNode<Flavour>>();

  const fetchDefaultFlavours = () => {
    return fetch('flavours.json')
    .then((response) => {
      return response.json();
    })
    .then((flavours) => {
      return flavours.map(flavour => {
        flavour.state = 'NO';
        return flavour;
      });
    });
  }

  useEffect(() => {
    /*
    TODO consider local storage behavior: check whether that's empty on app boot, if it is, fill from flavours.json
    */
    fetchDefaultFlavours().then((flavours) => {
      setFlavours(flavours);
    });
  }, []);

  useEffect(() => {
    if(!flavours || flavours.length === 0) {
      return;
    }

    setHierarchicalFlavours(d3.stratify<Flavour>()
      .id(d => d.uuid)
      .parentId(d => d.parentId)
        (flavours));
  }, [ flavours ]);

  const importNewFlavours = (data: any) => {
    let json = JSON.parse(data);
    setFlavours(json);
  }

  const handleElementClick = (uuid: string) => {
    // find the target flavour
    let targetFlavour = flavours.find(flavour => flavour.uuid === uuid);
    let targetHierarchicalFlavour = hierchicalFlavours.find(hierarchicalFlavour => hierarchicalFlavour.data.uuid === targetFlavour.uuid);

    // ignore root click
    if (targetHierarchicalFlavour.ancestors().length === 1) {
      return;
    }

    let oldState = targetFlavour.state;
    let newState = oldState === 'NO' ? 'YES'
      : oldState === 'YES' ? 'MAYBE'
      : 'NO';
    
    // 'NO'? Update all children to that
    if (newState === 'NO') {
      setFlavours(
        flavours.map(flavour => {
          if (flavour.uuid === uuid) {
            flavour.state = newState;
          } else {
            let hierarchicalFlavour = hierchicalFlavours.find(hierarchicalFlavour => hierarchicalFlavour.data.uuid === flavour.uuid);
            if (hierarchicalFlavour.ancestors().some(ancestor => ancestor.data.uuid === targetFlavour.uuid)) {
              flavour.state = newState;
            }
          }

          return flavour;
        })
      );
    }

    // 'YES'? Update the parents and children to that
    if (newState === 'YES') {
      setFlavours(
        flavours.map(flavour => {
          if (flavour.uuid === uuid) {
            flavour.state = newState;
          } else {
            let hierarchicalFlavour = hierchicalFlavours.find(hierarchicalFlavour => hierarchicalFlavour.data.uuid === flavour.uuid);
            if (hierarchicalFlavour.ancestors().some(ancestor => ancestor.data.uuid === targetFlavour.uuid)
              || hierarchicalFlavour.descendants().some(child => child.data.uuid === targetFlavour.uuid)) {
              flavour.state = newState;
            }
          }

          return flavour;
        })
      );
    }
    
    // 'MAYBE'? Update the children that have 'YES' to that
    if (newState === 'MAYBE') {
      setFlavours(
        flavours.map(flavour => {
          if (flavour.uuid === uuid) {
            flavour.state = newState;
          } else {
            let hierarchicalFlavour = hierchicalFlavours.find(hierarchicalFlavour => hierarchicalFlavour.data.uuid === flavour.uuid);
            if (hierarchicalFlavour.ancestors().some(ancestor => ancestor.data.uuid === targetFlavour.uuid
                && hierarchicalFlavour.data.state === 'YES')) {
              flavour.state = newState;
            }
          }

          return flavour;
        })
      );
    }
  }

  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 center">
            <div className="button-wrapper">
              <ExportAsImageButton></ExportAsImageButton>
              <ExportAsJsonButton flavours={flavours}></ExportAsJsonButton>
              <ImportJsonButton onUpload={importNewFlavours}></ImportJsonButton>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 center">
            <Smorgasbord
              hierchicalFlavours={hierchicalFlavours}
              onElementClick={handleElementClick}></Smorgasbord>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-12 center">
            <h2 id="what-is-this">What is this?</h2>
            <p>This is a tool to help you discuss and explore the relationships you'd like with your loved ones. It's inspired by the <a href="//www.multiamory.com/podcast/339-the-smorgasbord-of-relationships">Relationship Anarchy Smorgasbord</a>, which was initially developed by Lyrica Lawrence and Heather Orr in 2016.</p>
            <h2>How do I use it?</h2>
            <p>Focus on a specific relationship you have in your life. Then, have a look at the words written in each panel, and think about whether they're relevant to your relationship, or whether you'd like them to be. Reveal the colors of your relationship by clicking on the panels that you like.</p>
            <p>Exactly how you use this tool is up to you, but it works best when you share the results with your loved ones. You can either click through it together, or each use it independently and share your results with each other. The point is to have a conversation.</p>
            <h2>What is relationship anarchy?</h2>
            <p>Relationship anarchy is a way to approach relationships intentionally. Instead of assuming how a relationship should look based on its label (e.g. spouse, lover, parent, friend), you actively define what each person wants the relationship to look like. First described by Andie Nordgren in 2006, <a href="https://relationship-anarchy.com/2016-1-18-e3xi8xcwhx3gad4gwzz06r52dco3ni/">The Short Instructional Manifesto for Relationship Anarchy</a> is a good place to start if you're new to the idea.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
