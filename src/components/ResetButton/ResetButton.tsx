import { useTranslation } from "react-i18next";

interface ResetButtonProps {
  onReset: () => void;
}

const ResetButton = ({ onReset } : ResetButtonProps) => {
  const { t } = useTranslation();

  return (
    <div className="button-trigger" onClick={onReset}>
    <strong>{t('button.reset')}</strong>
    </div>
  )
}

export default ResetButton;
