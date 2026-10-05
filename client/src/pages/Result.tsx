import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import SuccessScreen from "../components/result/SuccessScreen";
import { ApiError, getMysteryById } from "../services/api";

import "./Result.css";

interface ResultLocationState {
  finalReveal?: string;
  nextMysteryId?: string | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function Result() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = location.state as ResultLocationState | null;

  const [finalReveal, setFinalReveal] = useState(navigationState?.finalReveal ?? null);
  const [nextMysteryId, setNextMysteryId] = useState<string | null>(
    navigationState?.nextMysteryId ?? null,
  );
  const [isLoading, setIsLoading] = useState(!navigationState?.finalReveal);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Mystery ID is missing from the URL.");
      setIsLoading(false);
      return;
    }

    let isCurrentRequest = true;

    getMysteryById(id)
      .then((mystery) => {
        if (!isCurrentRequest) return;

        if (!mystery.completed) {
          setError("This mystery has not been completed yet.");
          return;
        }

        setFinalReveal(mystery.finalReveal ?? null);
        setNextMysteryId(mystery.nextMysteryId ?? null);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (isCurrentRequest) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id]);

  const hasNextMystery = Boolean(nextMysteryId);

  function goToNextMystery() {
    if (!nextMysteryId) return;

    navigate(`/mystery/${encodeURIComponent(nextMysteryId)}`);
  }

  if (isLoading) {
    return (
      <main className="result-page" aria-busy="true">
        <div className="result-page__container container">
          <p>Loading final reveal...</p>
        </div>
      </main>
    );
  }

  if (error || !finalReveal) {
    return (
      <main className="result-page">
        <div className="result-page__container container">
          <p className="result-page__notice" role="alert">
            {error ?? "The final reveal is unavailable."}
          </p>
          <Link className="result-page__home-link" to="/">Back Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="result-page">
      <div className="result-page__container container">
        <div className="result-page__breadcrumb">
          <span>Mystery Room</span>
          <span aria-hidden="true">/</span>
          <span>Final Reveal</span>
        </div>

        <SuccessScreen
          title={hasNextMystery ? "Mystery Complete!" : "All Mysteries Solved!"}
          message={
            hasNextMystery
              ? "You uncovered the truth hidden inside this room."
              : "You solved every mystery and uncovered the full truth."
          }
          detail={finalReveal}
          primaryLabel={hasNextMystery ? "Next Mystery" : "Back Home"}
          onPrimary={
            hasNextMystery
              ? goToNextMystery
              : () => navigate("/")
          }
        />

        <div className="result-page__actions">
          {hasNextMystery ? (
            <Link
              className="result-page__next-link"
              to={`/mystery/${encodeURIComponent(nextMysteryId as string)}`}
            >
              Continue to the next room <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <Link className="result-page__next-link" to="/">
              Return to Home <span aria-hidden="true">→</span>
            </Link>
          )}

          <Link className="result-page__home-link" to="/">Back Home</Link>
        </div>
      </div>
    </main>
  );
}

export default Result;
