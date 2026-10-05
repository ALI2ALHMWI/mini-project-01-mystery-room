import { useEffect, useState, type FormEvent } from "react";

import "./QuestionCard.css";

type FeedbackType = "success" | "error" | null;

interface QuestionCardProps {
  questionId: number;
  questionNumber: number;
  totalQuestions: number;
  question: string;
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
  feedback?: {
    type: FeedbackType;
    message: string;
  };
  onRetry?: () => void;
  onHint?: () => void;
  canUseHint?: boolean;
  isRequestingHint?: boolean;
}

function QuestionCard({
  questionId,
  questionNumber,
  totalQuestions,
  question,
  onSubmit,
  isSubmitting = false,
  feedback = {
    type: null,
    message: "",
  },
  onRetry,
  onHint,
  canUseHint = false,
  isRequestingHint = false,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setAnswer("");
  }, [questionId]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer || isSubmitting) {
      return;
    }

    onSubmit(trimmedAnswer);
  };

  const progress =
    totalQuestions > 0
      ? Math.round((questionNumber / totalQuestions) * 100)
      : 0;

  const hasFeedback = Boolean(feedback.type && feedback.message);

  return (
    <section className="question-card" aria-labelledby="question-card-title">
      <div className="question-card__top">
        <div className="question-card__heading">
          <span className="question-card__icon" aria-hidden="true">
            ?
          </span>

          <div>
            <span className="question-card__eyebrow">Question</span>

            <span className="question-card__counter">
              {questionNumber} / {totalQuestions}
            </span>
          </div>
        </div>

        <span className="question-card__close" aria-hidden="true">
          ×
        </span>
      </div>

      <div className="question-card__progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="question-card__body">
        <h2 id="question-card-title" className="question-card__question">
          {question}
        </h2>

        <form className="question-card__form" onSubmit={handleSubmit}>
          <label
            className="question-card__input-label"
            htmlFor="mystery-answer"
          >
            Your answer
          </label>

          <input
            id="mystery-answer"
            name="answer"
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Enter your answer..."
            autoComplete="off"
            spellCheck={false}
            disabled={isSubmitting}
            className="question-card__input"
            aria-describedby={hasFeedback ? "question-feedback" : undefined}
          />

          <button
            type="submit"
            className="question-card__submit"
            disabled={!answer.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="question-card__spinner" aria-hidden="true" />
                Checking...
              </>
            ) : (
              <>
                Submit Answer
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        {hasFeedback && (
          <div
            id="question-feedback"
            className={`question-card__feedback question-card__feedback--${feedback.type}`}
            role="alert"
          >
            <span className="question-card__feedback-icon" aria-hidden="true">
              {feedback.type === "success" ? "✓" : "×"}
            </span>

            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default QuestionCard;
