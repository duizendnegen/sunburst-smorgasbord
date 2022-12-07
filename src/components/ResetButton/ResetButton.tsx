import { useTranslation } from "react-i18next";

interface ResetButtonProps {
  onReset: () => void;
}

const ResetButton = ({ onReset } : ResetButtonProps) => {
  const { t } = useTranslation();

  return (
    <button className="button" onClick={onReset}>
      <strong>{t('button.reset')}</strong>
    </button>
  )
}

export default ResetButton;
