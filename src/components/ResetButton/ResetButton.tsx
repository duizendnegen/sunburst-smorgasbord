import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ResetButtonProps {
  onReset: () => void;
}

const ResetButton = ({ onReset } : ResetButtonProps) => {
  const { t } = useTranslation();
  const [resetConfirmationVisible, setResetConfirmationvisible] = useState<boolean>(false);

  return (
    <div>
      <button className="button is-primary" onClick={() => { setResetConfirmationvisible(true); }}>
        <strong>{t('button.reset')}</strong>
      </button>
      <div className={resetConfirmationVisible ? 'modal is-active' : 'modal'}>
        <div className="modal-background" onClick={() => { setResetConfirmationvisible(false); }}></div>
        <div className="modal-card">
          <section className="modal-card-body">
            <p>
              {t('reset.content')}
            </p>
          </section>
          <footer className="modal-card-foot">
            <button className="button is-primary" onClick={() => { onReset(); setResetConfirmationvisible(false); }}>{t('reset.confirm')}</button>
            <button className="button" onClick={() => { setResetConfirmationvisible(false); }}>{t('reset.cancel')}</button>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default ResetButton;
