import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './App.css';
import * as d3 from "d3";

import Smorgasbord from './components/Smorgasbord/Smorgasbord';
import Flavour from './interfaces';
import ImportJsonButton from './components/ImportJsonButton/ImportJsonButton';
import ExportAsJsonButton from './components/ExportAsJsonButton/ExportAsJsonButton';
import ExportAsImageButton from './components/ExportAsImageButton/ExportAsImageButton';
import ResetButton from './components/ResetButton/ResetButton';
import EditButton from './components/EditButton/EditButton';
import EditModal from './components/EditModal/EditModal';

const App = () => {
  const { t, i18n } = useTranslation();

  const [flavours, setFlavours] = useState([]);
  const [hierchicalFlavours, setHierarchicalFlavours] = useState<d3.HierarchyNode<Flavour>>();
  const [editModalActive, setEditModalActive] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

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
    let flavours;

    if (localStorage) {
      flavours = JSON.parse(localStorage.getItem('flavours'));
    }

    if (flavours) {
      setFlavours(flavours);
    } else {
      fetchDefaultFlavours().then((flavours) => {
        setFlavours(flavours);
      });
    }
  }, []);

  useEffect(() => {
    if(!flavours || flavours.length === 0) {
      return;
    }

    if (localStorage) {
      localStorage.setItem('flavours', JSON.stringify(flavours));
    }

    try {
      // TODO double check whether the input is valid :)

      setHierarchicalFlavours(d3.stratify<Flavour>()
        .id(d => d.uuid)
        .parentId(d => d.parentUuid)
          (flavours));
    } catch {
      fetchDefaultFlavours().then((flavours) => {
        setFlavours(flavours);
      });
    }
  }, [ flavours ]);

  const importNewFlavours = (data: any) => {
    let json = JSON.parse(data);
    setFlavours(json);
  }

  const resetFlavours = () => {
    fetchDefaultFlavours().then((flavours) => {
      setFlavours(flavours);
    });
  }

  const toggleEditMode = () => {
    setEditModalActive(!editModalActive);
  }

  const handleEditModalChange = (data: any) => {
    setFlavours(data);
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

    // 'YES'? Update the parents to that
    if (newState === 'YES') {
      setFlavours(
        flavours.map(flavour => {
          if (flavour.uuid === uuid) {
            flavour.state = newState;
          } else {
            let hierarchicalFlavour = hierchicalFlavours.find(hierarchicalFlavour => hierarchicalFlavour.data.uuid === flavour.uuid);
            if (hierarchicalFlavour.descendants().some(child => child.data.uuid === targetFlavour.uuid)) {
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

  // TODO break up this file in separate sub-files;
  // bring part of this down to the actual functional app;
  // extract out the header, the FAQ and the footer

  // TODO fingerprnt the translation.json files

  return (
    <Suspense fallback="loading">
      <section className="section">
        <div className="container content has-text-centered">
          <h1 className="title">{t('header.title')}</h1>
          <h2 className="subtitle">{t('header.subtitle')}</h2>
          <p>
            <a href="#what-is-this">{t('faq.whats_this')}</a>
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container content">
          <div className="buttons has-addons is-centered mb-6">
            <ExportAsImageButton></ExportAsImageButton>
            <ExportAsJsonButton flavours={flavours}></ExportAsJsonButton>
            <ImportJsonButton onUpload={importNewFlavours}></ImportJsonButton>
            <EditButton onClick={toggleEditMode}></EditButton>
            <ResetButton onReset={resetFlavours}></ResetButton>
          </div>
        </div>
        <EditModal
          isActive={editModalActive}
          flavours={flavours}
          onChange={handleEditModalChange}
          onClose={toggleEditMode}></EditModal>
        <div className="container content has-text-centered">
          <Smorgasbord
            hierchicalFlavours={hierchicalFlavours}
            onElementClick={handleElementClick}></Smorgasbord>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="content has-text-centered">
            <h2 id="what-is-this" className="title is-4">{t('faq.whats_this')}</h2>
            <p dangerouslySetInnerHTML={{__html: t('faq.whats_this_content')}}></p>
            <h2 className="title is-4">{t('faq.how_to_use')}</h2>
            <p>{t('faq.how_to_use_content_1')}</p>
            <p>{t('faq.how_to_use_content_2')}</p>
            <h2 className="title is-4">{t('faq.whats_ra')}</h2>
            <p dangerouslySetInnerHTML={{__html: t('faq.whats_ra_content')}}></p>
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="content">
          <h3>{t('header.title')}</h3>
          <p>
            Available in&nbsp;
            <button className="button-link" onClick={() => changeLanguage('en')}>English</button>,&nbsp;
            <button className="button-link" onClick={() => changeLanguage('de')}>German</button>.
          </p>
          <p dangerouslySetInnerHTML={{__html: t('footer.disclaimer')}}></p>
        </div>
      </footer>
    </Suspense>
  );
}

export default App;
