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
    <aside className="hint-card">
      <div className="hint-card__header">
        <div>
          <span className="hint-card__label">Need a clue?</span>

          <h3 className="hint-card__title">Hint</h3>
        </div>

        <span className="hint-card__counter">
          {hintsUsed} / {maxHints}
        </span>
      </div>

      <div className="hint-card__content">
        {hint ? (
          <p className="hint-card__text">{hint}</p>
        ) : (
          <p className="hint-card__empty">
            Stuck? You can use a hint to help solve this question.
          </p>
        )}

        <button
          type="button"
          className="hint-card__button"
          onClick={onRequestHint}
          disabled={!canRequestHint}
        >
          {isLoading
            ? "Getting Hint..."
            : hintsRemaining === 0
              ? "No Hints Remaining"
              : hint
                ? "Get Another Hint"
                : "Get Hint"}
        </button>

        <p className="hint-card__remaining">
          {hintsRemaining === 0
            ? "You have used all available hints."
            : `${hintsRemaining} hint${
                hintsRemaining === 1 ? "" : "s"
              } remaining`}
        </p>
      </div>
    </aside>
  );
}

export default HintCard;
