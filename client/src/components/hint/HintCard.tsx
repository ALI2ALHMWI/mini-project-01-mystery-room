import "./HintCard.css";

interface HintCardProps {
  hint?: string;
  hintsUsed: number;
  maxHints?: number;
  onRequestHint: () => void;
  isLoading?: boolean;
}

function HintCard({
  hint,
  hintsUsed,
  maxHints = 2,
  onRequestHint,
  isLoading = false,
}: HintCardProps) {
  const hintsRemaining = Math.max(maxHints - hintsUsed, 0);
  const canRequestHint = hintsRemaining > 0 && !isLoading;

  return (
    <aside className="hint-card" aria-labelledby="hint-card-title">
      <div className="hint-card__header">
        <div className="hint-card__heading">
          <span className="hint-card__icon" aria-hidden="true">
            !
          </span>

          <div>
            <span className="hint-card__eyebrow">Need a clue?</span>
            <h2 id="hint-card-title">Hint</h2>
          </div>
        </div>

        <span className="hint-card__counter">
          {hintsUsed}/{maxHints}
        </span>
      </div>

      <div className="hint-card__body">
        {hint ? (
          <div className="hint-card__revealed">
            <span className="hint-card__revealed-label">Clue revealed</span>

            <p>{hint}</p>
          </div>
        ) : (
          <p className="hint-card__empty">
            Look carefully around the room. You can reveal a clue if you need
            help.
          </p>
        )}

        <button
          type="button"
          className="hint-card__button"
          onClick={onRequestHint}
          disabled={!canRequestHint}
        >
          <span className="hint-card__button-icon" aria-hidden="true">
            !
          </span>

          <span>
            {isLoading
              ? "Getting Hint..."
              : hintsRemaining === 0
                ? "No Hints Remaining"
                : hint
                  ? "Get Another Hint"
                  : "View Hint"}
          </span>

          {canRequestHint && (
            <span className="hint-card__button-arrow" aria-hidden="true">
              →
            </span>
          )}
        </button>

        <div className="hint-card__footer">
          <span className="hint-card__footer-dot" aria-hidden="true" />
          <span>
            {hintsRemaining === 0
              ? "You have used all available hints."
              : `${hintsRemaining} hint${
                  hintsRemaining === 1 ? "" : "s"
                } remaining`}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default HintCard;
