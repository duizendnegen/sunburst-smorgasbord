import { useTranslation } from "react-i18next";

interface ResetButtonProps {
  onClick: () => void;
}

const ResetButton = ({ onClick } : ResetButtonProps) : JSX.Element => {
  const { t } = useTranslation();

  return (
    <button className="button is-primary" onClick={onClick}>
      <strong>{t("button.reset")}</strong>
    </button>
  )
}

export default ResetButton;
