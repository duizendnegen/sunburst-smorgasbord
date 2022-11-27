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

const App = () => {
  const { t, i18n } = useTranslation();

  const [flavours, setFlavours] = useState([]);
  const [hierchicalFlavours, setHierarchicalFlavours] = useState<d3.HierarchyNode<Flavour>>();

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

  // TODO break up this file in separate sub-files;
  // bring part of this down to the actual functional app;
  // extract out the header, the FAQ and the footer

  // TODO fingerprnt the translation.json files

  return (
    <Suspense fallback="loading">
      <div className="jumbotron">
        <div className="container">
          <div className="row">
            <div className="col-12 center">
              <div className="img img-logo center"></div>
              <h1>{t('header.title')}</h1>
              <h2 className="font-light">{t('header.subtitle')}</h2>
              <a href="#what-is-this">{t('faq.whats_this')}</a>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 center">
              <div className="button-wrapper">
                <ExportAsImageButton></ExportAsImageButton>
                <ExportAsJsonButton flavours={flavours}></ExportAsJsonButton>
                <ImportJsonButton onUpload={importNewFlavours}></ImportJsonButton>
                <ResetButton onReset={resetFlavours}></ResetButton>
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
              <h2 id="what-is-this">{t('faq.whats_this')}</h2>
              <p dangerouslySetInnerHTML={{__html: t('faq.whats_this_content')}}></p>
              <h2>{t('faq.how_to_use')}</h2>
              <p>{t('faq.how_to_use_content_1')}</p>
              <p>{t('faq.how_to_use_content_2')}</p>
              <h2>{t('faq.whats_ra')}</h2>
              <p dangerouslySetInnerHTML={{__html: t('faq.whats_ra_content')}}></p>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-4 hidden-sm"></div>
        <div className="col-4">
          <div className="line"></div>
        </div>
        <div className="col-4 hidden-sm"></div>
      </div>
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h3>{t('header.title')}</h3>
              <p>
                Available in&nbsp;
                <a href='#' onClick={() => changeLanguage('en')}>English</a>,&nbsp;
                <a href='#' onClick={() => changeLanguage('de')}>German</a>.
              </p>
              <p dangerouslySetInnerHTML={{__html: t('footer.disclaimer')}}></p>
            </div>
          </div>
        </div>
      </footer>
    </Suspense>
  );
}

export default App;
