import { FormEvent, useState } from "react";
import "./QuestionCard.css";

type FeedbackType = "success" | "error" | null;

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
  feedback?: {
    type: FeedbackType;
    message: string;
  };
}

function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  onSubmit,
  isSubmitting = false,
  feedback = {
    type: null,
    message: "",
  },
}: QuestionCardProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer || isSubmitting) {
      return;
    }

    onSubmit(trimmedAnswer);
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <section className="question-card">
      <div className="question-card__header">
        <div>
          <span className="question-card__label">Question</span>

          <p className="question-card__progress">
            {questionNumber} / {totalQuestions}
          </p>
        </div>

        <div className="question-card__progress-bar">
          <span
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="question-card__body">
        <h2 className="question-card__question">{question}</h2>

        <form className="question-card__form" onSubmit={handleSubmit}>
          <label className="question-card__input-label" htmlFor="answer">
            Your answer
          </label>

          <input
            id="answer"
            name="answer"
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Enter your answer..."
            autoComplete="off"
            disabled={isSubmitting}
            className="question-card__input"
          />

          <button
            type="submit"
            disabled={!answer.trim() || isSubmitting}
            className="question-card__submit"
          >
            {isSubmitting ? (
              <>
                <span className="question-card__spinner" />
                Checking...
              </>
            ) : (
              "Submit Answer"
            )}
          </button>
        </form>

        {feedback?.type && feedback.message && (
          <div
            className={`question-card__feedback question-card__feedback--${feedback.type}`}
            role="alert"
          >
            <span className="question-card__feedback-icon">
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
