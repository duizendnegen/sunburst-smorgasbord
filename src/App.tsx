import { Suspense, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";

import "./App.scss";

import Smorgasbord from "./components/Smorgasbord/Smorgasbord";
import Flavour from "./interfaces";
import ImportJsonButton from "./components/ImportJsonButton/ImportJsonButton";
import ExportAsJsonButton from "./components/ExportAsJsonButton/ExportAsJsonButton";
import ExportAsImageButton from "./components/ExportAsImageButton/ExportAsImageButton";
import ResetButton from "./components/ResetButton/ResetButton";
import EditButton from "./components/EditButton/EditButton";
import EditModal from "./components/EditModal/EditModal";
import ResetConfirmationModal from "./components/ResetConfirmationModal/ResetConfirmationModal";
import flavoursState from "./states/flavours.atom";
import hierarchicalFlavoursState from "./states/hierarchicalFlavours.selector";

const App = () : JSX.Element => {
  const { t, i18n } = useTranslation();

  const [flavours, setFlavours] = useRecoilState(flavoursState);
  const hierarchicalFlavours = useRecoilValue(hierarchicalFlavoursState);

  const [resetConfirmationModalActive, setResetConfirmationModalActive] = useState<boolean>(false);
  const [editModalActive, setEditModalActive] = useState<boolean>(false);

  const [buttonsFloating, setButtonsFloating] = useState<boolean>(false);

  const changeLanguage = (lang) : void => {
    i18n.changeLanguage(lang);
  };

  const fetchDefaultFlavours = () : Promise<Flavour[]> => {
    return fetch("flavours.json")
      .then((response) => {
        return response.json();
      })
      .then((flavours) => {
        return flavours.map(flavour => {
          flavour.state = "NO";
          return flavour;
        });
      });
  }

  useEffect(() => {
    let flavours;

    if (localStorage) {
      flavours = JSON.parse(localStorage.getItem("flavours"));
    }

    if (flavours) {
      setFlavours(flavours);
    } else {
      fetchDefaultFlavours().then((flavours) => {
        setFlavours(flavours);
      })
    }
  }, [ setFlavours ]);

  useEffect(() => {
    if (!flavours || flavours.length === 0) {
      return;
    }

    if (localStorage) {
      localStorage.setItem("flavours", JSON.stringify(flavours));
    }
  }, [ flavours ])

  const handleScroll = useCallback(() => {
    let buttonPosition = document.getElementsByClassName("js-button-container-scrolltop")[0].getBoundingClientRect().top;
    if (buttonPosition < 30 && !buttonsFloating) {
      setButtonsFloating(true);
    } else if (buttonPosition >= 30 && buttonsFloating) {
      setButtonsFloating(false);
    }
  }, [ buttonsFloating ]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    }
  }, [ handleScroll ]);

  const resetFlavours = () : void => {
    fetchDefaultFlavours().then((flavours) => {
      setFlavours(flavours);
    });
  }

  const toggleEditMode = () : void => {
    setEditModalActive(!editModalActive);
  }

  const handleElementClick = (uuid: string) : void => {
    // find the target flavour
    let targetFlavour = flavours.find(flavour => flavour.uuid === uuid);
    let targetHierarchicalFlavour = hierarchicalFlavours.find(hierarchicalFlavour => hierarchicalFlavour.data.uuid === targetFlavour.uuid);

    // ignore root click
    if (targetHierarchicalFlavour.ancestors().length === 1) {
      return;
    }

    let oldState = targetFlavour.state;
    let newState = oldState === "NO" ? "YES"
      : oldState === "YES" ? "MAYBE"
        : "NO";
    
    setFlavours(
      flavours.map((flavour): Flavour => {
        if (flavour.uuid === uuid) {
          return {
            ...flavour,
            state: newState
          }
        } else {
          let hierarchicalFlavour = hierarchicalFlavours.find(hierarchicalFlavour => hierarchicalFlavour.data.uuid === flavour.uuid);
          if (
            (
              newState === "NO" // 'NO'? Update all children to that
              && hierarchicalFlavour.ancestors().some(ancestor => ancestor.data.uuid === targetFlavour.uuid)
            ) ||
            (
              newState === "YES" // 'YES'? Update the parents to that
              && hierarchicalFlavour.descendants().some(child => child.data.uuid === targetFlavour.uuid)
            ) ||
            (
              newState === "MAYBE" // 'MAYBE'? Update the children that have 'YES' to that
              && hierarchicalFlavour.ancestors().some(ancestor => ancestor.data.uuid === targetFlavour.uuid && hierarchicalFlavour.data.state === "YES")
            )) {
            return {
              ...flavour,
              state: newState
            }
          }
        }

        return flavour;
      })
    );
  }

  // TODO break up this file in separate sub-files;
  // bring part of this down to the actual functional app;
  // extract out the header, the FAQ and the footer

  return (
    <Suspense fallback="loading">
      <section className="section">
        <div className="container content has-text-centered">
          <h1 className="title">{t("header.title")}</h1>
          <h2 className="subtitle">{t("header.subtitle")}</h2>
          <p>
            <a href="#what-is-this">{t("faq.whats_this")}</a>
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container content">
          <div className='js-button-container-scrolltop buttons-wrapper'>
            <div className={ buttonsFloating
              ? "buttons has-addons is-centered is-fixed"
              : "buttons has-addons is-centered"}>
              <ExportAsImageButton></ExportAsImageButton>
              <ExportAsJsonButton></ExportAsJsonButton>
              <ImportJsonButton></ImportJsonButton>
              <EditButton onClick={toggleEditMode}></EditButton>
              <ResetButton onClick={() : void => { setResetConfirmationModalActive(true); }}></ResetButton>
            </div>
          </div>
        </div>
      </section>
      <ResetConfirmationModal
        isActive={resetConfirmationModalActive}
        onReset={() : void => { resetFlavours(); setResetConfirmationModalActive(false); }}
        onCancel={() : void => { setResetConfirmationModalActive(false); }}
      ></ResetConfirmationModal>
      <EditModal
        isActive={editModalActive}
        onClose={toggleEditMode}></EditModal>
      <section className="section">
        <div className="container content has-text-centered">
          <Smorgasbord
            onElementClick={handleElementClick}></Smorgasbord>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="content has-text-centered">
            <h2 id="what-is-this" className="title is-4">{t("faq.whats_this")}</h2>
            <p dangerouslySetInnerHTML={{__html: t("faq.whats_this_content")}}></p>
            <h2 className="title is-4">{t("faq.how_to_use")}</h2>
            <p>{t("faq.how_to_use_content_1")}</p>
            <p>{t("faq.how_to_use_content_2")}</p>
            <h2 className="title is-4">{t("faq.whats_ra")}</h2>
            <p dangerouslySetInnerHTML={{__html: t("faq.whats_ra_content")}}></p>
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="content">
          <h3>{t("header.title")}</h3>
          <p>
            {t("footer.languages")}&nbsp;
            <button className="button-link" onClick={() : void => changeLanguage("en")}>{t("footer.languages_english")}</button>,&nbsp;
            <button className="button-link" onClick={() : void => changeLanguage("de")}>{t("footer.languages_german")}</button>.
          </p>
          <p dangerouslySetInnerHTML={{__html: t("footer.disclaimer")}}></p>
        </div>
      </footer>
    </Suspense>
  );
}

export default App;
