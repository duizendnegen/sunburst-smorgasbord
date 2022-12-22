import { useTranslation } from "react-i18next";

interface EditButtonProps {
  onClick: () => void;
}

const EditButton = ({ onClick } : EditButtonProps) : JSX.Element => {
  const { t } = useTranslation();

  return (
    <button className="button is-primary" onClick={onClick}>
      <strong>{t("button.edit")}</strong>
    </button>
  )
}

export default EditButton;
