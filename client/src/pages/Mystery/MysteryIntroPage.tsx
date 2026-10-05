import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ApiError, getMysteryById } from "../../services/api";
import type { Mystery } from "../../types/mystery.types";
import "./MysteryIntroPage.css";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function MysteryIntroPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mystery, setMystery] = useState<Mystery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMystery = useCallback(async () => {
    if (!id) {
      setError("Mystery ID is missing from the URL.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loaded = await getMysteryById(id);

      if (loaded.completed) {
        navigate(`/result/${encodeURIComponent(id)}`, { replace: true });
        return;
      }

      setMystery(loaded);
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadMystery();
  }, [loadMystery]);

  if (isLoading) {
    return (
      <main className="mystery-intro" aria-busy="true">
        <div className="mystery-intro__container container">
          <p>Loading mystery...</p>
        </div>
      </main>
    );
  }

  if (error || !mystery) {
    return (
      <main className="mystery-intro">
        <div className="mystery-intro__container container">
          <p className="mystery-intro__error" role="alert">
            {error ?? "Mystery data is unavailable."}
          </p>
          <Link className="mystery-intro__back" to="/">
            Back Home
          </Link>
        </div>
      </main>
    );
  }

  const totalQuestions = mystery.questions.length;
  const totalHints = mystery.questions.reduce(
    (total, question) => total + question.maxHints,
    0,
  );

  return (
    <main className="mystery-intro">
      <div className="mystery-intro__container container">
        <div className="mystery-intro__breadcrumb">
          <Link to="/">Mystery Room</Link>
          <span aria-hidden="true">/</span>
          <span>Explore</span>
        </div>

        <section className="mystery-intro__hero">
          <div className="mystery-intro__content">
            <span className="mystery-intro__eyebrow">Mystery Room</span>
            <h1>{mystery.title}</h1>
            <p className="mystery-intro__description">{mystery.description}</p>

            <div className="mystery-intro__stats" aria-label="Mystery information">
              <div>
                <strong>{totalQuestions}</strong>
                <span>Questions</span>
              </div>
              <div>
                <strong>{totalHints}</strong>
                <span>Hints available</span>
              </div>
            </div>

            <div className="mystery-intro__actions">
              <Link
                className="mystery-intro__start"
                to={`/mystery/${encodeURIComponent(mystery.id)}`}
              >
                Start Investigation
                <span aria-hidden="true">→</span>
              </Link>
              <Link className="mystery-intro__back" to="/">
                Back Home
              </Link>
            </div>
          </div>

          <div className="mystery-intro__story">
            <span className="mystery-intro__story-label">The Story</span>
            <h2>Something is waiting to be discovered.</h2>
            <p>{mystery.story}</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default MysteryIntroPage;
