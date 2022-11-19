interface EditButtonProps {
  onClick: () => void;
}

const EditButton = ({ onClick } : EditButtonProps) => {
  return (
    <button className="button" onClick={onClick}>
      <strong>Edit</strong>
    </button>
  )
}

export default EditButton;
