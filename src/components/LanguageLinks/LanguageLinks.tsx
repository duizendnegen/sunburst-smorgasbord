import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../../constants";

const LanguageLinks = () : JSX.Element => {
  const { t, i18n } = useTranslation();

  return (
    <p>
      {t("footer.languages")}&nbsp;
      {LANGUAGES.map(({ code, name }, i) => (
        <Fragment key={code}>
          {i > 0 && <>,&nbsp;</>}
          <button className="button-link" lang={code} onClick={() : void => { i18n.changeLanguage(code); }}>{name}</button>
        </Fragment>
      ))}.
    </p>
  );
}

export default LanguageLinks;
