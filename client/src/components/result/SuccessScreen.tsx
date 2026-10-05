import "./SuccessScreen.css";

interface SuccessScreenProps {
  title?: string;
  message?: string;
  detail?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

function SuccessScreen({
  title = "Correct!",
  message = "You found the right answer.",
  detail,
  primaryLabel = "Continue",
  secondaryLabel,
  onPrimary,
  onSecondary,
}: SuccessScreenProps) {
  return (
    <section className="success-screen" aria-labelledby="success-screen-title">
      <div className="success-screen__icon" aria-hidden="true">
        ✓
      </div>

      <p className="success-screen__eyebrow">Mystery solved</p>

      <h1 id="success-screen-title">{title}</h1>

      <p className="success-screen__message">{message}</p>

      {detail && <p className="success-screen__detail">{detail}</p>}

      <div className="success-screen__actions">
        {onPrimary ? (
          <button
            type="button"
            className="success-screen__primary"
            onClick={onPrimary}
          >
            {primaryLabel}
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <span className="success-screen__primary">
            {primaryLabel}
            <span aria-hidden="true">→</span>
          </span>
        )}

        {secondaryLabel && onSecondary && (
          <button
            type="button"
            className="success-screen__secondary"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </section>
  );
}

export default SuccessScreen;
