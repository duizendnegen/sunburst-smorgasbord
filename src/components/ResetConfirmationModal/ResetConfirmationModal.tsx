import { useTranslation } from "react-i18next";

interface ResetConfirmationModalProps {
  onReset: () => void;
  onCancel: () => void;
  isActive: boolean;
}

const ResetConfirmationModal = ({ onReset, onCancel, isActive } : ResetConfirmationModalProps) : JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={isActive ? "modal is-active" : "modal"}>
      <div className="modal-background" onClick={onCancel}></div>
      <div className="modal-card">
        <section className="modal-card-body">
          <p>
            {t("reset.content")}
          </p>
        </section>
        <footer className="modal-card-foot">
          <button className="button is-primary" onClick={onReset}>{t("reset.confirm")}</button>
          <button className="button" onClick={onCancel}>{t("reset.cancel")}</button>
        </footer>
      </div>
    </div>
  )
}

export default ResetConfirmationModal;
