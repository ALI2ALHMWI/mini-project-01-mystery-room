import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, getMysteryById } from "../services/api";
import type { Mystery } from "../types/mystery.types";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load the result. Please try again.";
}

function Result() {
  const { id } = useParams<{ id: string }>();

  const [mystery, setMystery] = useState<Mystery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Mystery ID is missing.");
      setIsLoading(false);
      return;
    }

    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);

    getMysteryById(id)
      .then((loadedMystery) => {
        if (!isCurrentRequest) {
          return;
        }

        if (!loadedMystery.completed) {
          setError("This mystery has not been completed yet.");
          return;
        }

        setMystery(loadedMystery);
      })
      .catch((requestError: unknown) => {
        if (isCurrentRequest) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main className="result-page" aria-busy="true">
        <section className="result-card">
          <p>Loading result...</p>
        </section>
      </main>
    );
  }

  if (error || !mystery) {
    return (
      <main className="result-page">
        <section className="result-card">
          <h1>Unable to Load Result</h1>
          <p role="alert">{error ?? "Result data is unavailable."}</p>

          <div className="result-actions">
            <Link className="primary-button" to="/">
              Back Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const hasNextMystery = Boolean(mystery.nextMysteryId);

  return (
    <main className="result-page">
      <section className="result-card">
        <h1>Mystery Complete</h1>

        <p className="final-reveal">
          {mystery.finalReveal ?? "You solved this mystery."}
        </p>

        <div className="result-actions">
          {hasNextMystery && mystery.nextMysteryId ? (
            <Link
              className="primary-button"
              to={`/mystery/${encodeURIComponent(mystery.nextMysteryId)}`}
            >
              Next Mystery
            </Link>
          ) : (
            <p className="final-completion">
              You solved all available mysteries.
            </p>
          )}

          <Link className="secondary-button" to="/">
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Result;
