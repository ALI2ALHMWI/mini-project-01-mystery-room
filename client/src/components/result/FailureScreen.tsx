import "./FailureScreen.css";

interface FailureScreenProps {
  message?: string;
  onRetry: () => void;
  onHint?: () => void;
  canUseHint?: boolean;
  isRequestingHint?: boolean;
}

function FailureScreen({
  message = "That's not the correct answer.",
  onRetry,
  onHint,
  canUseHint = false,
  isRequestingHint = false,
}: FailureScreenProps) {
  return (
    <section className="failure-screen" aria-labelledby="failure-screen-title">
      <div className="failure-screen__icon" aria-hidden="true">
        ×
      </div>

      <p className="failure-screen__eyebrow">Not quite</p>

      <h1 id="failure-screen-title">Try Again!</h1>

      <p className="failure-screen__message">{message}</p>

      <p className="failure-screen__detail">
        Keep exploring the room and look for more clues.
      </p>

      <div className="failure-screen__actions">
        <button
          type="button"
          className="failure-screen__primary"
          onClick={onRetry}
        >
          Try Again
        </button>

        {onHint && (
          <button
            type="button"
            className="failure-screen__secondary"
            onClick={onHint}
            disabled={!canUseHint || isRequestingHint}
          >
            {isRequestingHint ? "Getting Hint..." : "Get Hint"}
          </button>
        )}
      </div>
    </section>
  );
}

export default FailureScreen;
