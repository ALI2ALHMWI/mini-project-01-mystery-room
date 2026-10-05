import { Link, useLocation, useParams } from "react-router-dom";

import SuccessScreen from "../components/result/SuccessScreen";

import "./Result.css";

interface ResultLocationState {
  finalReveal?: string;
  nextMysteryId?: string | null;
}

function Result() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const state = location.state as ResultLocationState | null;

  const finalReveal = state?.finalReveal;
  const nextMysteryId = state?.nextMysteryId ?? null;

  const hasNextMystery = Boolean(nextMysteryId);

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
          detail={
            finalReveal ??
            "The final reveal will appear here after the mystery is completed."
          }
          primaryLabel={hasNextMystery ? "Next Mystery" : "Back Home"}
        />

        <div className="result-page__actions">
          {hasNextMystery ? (
            <Link
              className="result-page__next-link"
              to={`/mystery/${encodeURIComponent(nextMysteryId as string)}`}
            >
              Continue to the next room
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <Link className="result-page__next-link" to="/">
              Return to Home
              <span aria-hidden="true">→</span>
            </Link>
          )}

          <Link className="result-page__home-link" to="/">
            Back Home
          </Link>
        </div>

        {!finalReveal && (
          <p className="result-page__notice">
            Result ID: {id}. Refreshing the page may remove temporary navigation
            state because the final reveal is passed after completion.
          </p>
        )}
      </div>
    </main>
  );
}

export default Result;
