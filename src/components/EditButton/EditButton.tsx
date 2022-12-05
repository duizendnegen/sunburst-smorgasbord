import { useTranslation } from "react-i18next";

interface EditButtonProps {
  onClick: () => void;
}

const EditButton = ({ onClick } : EditButtonProps) => {
  const { t } = useTranslation();

  return (
    <button className="button" onClick={onClick}>
      <strong>{t('button.edit')}</strong>
    </button>
  )
}

export default EditButton;
