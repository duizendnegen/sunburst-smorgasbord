interface ResetButtonProps {
  onReset: () => void;
}

const ResetButton = ({ onReset } : ResetButtonProps) => {
  return (
    <div className="button-trigger" onClick={onReset}>
      <strong>Reset</strong>
    </div>
  )
}

export default ResetButton;
