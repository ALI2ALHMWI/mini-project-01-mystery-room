import { Link } from "react-router-dom";
import "./SystemState.css";

type SystemStateVariant = "not-found" | "offline" | "error";

interface SystemStateProps {
  variant: SystemStateVariant;
  title: string;
  message: string;
  onRetry?: () => void;
}

const labels = {
  "not-found": "Mystery Room / 404",
  offline: "Mystery Room / Connection",
  error: "Mystery Room / Error",
} as const;

export default function SystemState({
  variant,
  title,
  message,
  onRetry,
}: SystemStateProps) {
  return (
    <main className="system-state">
      <section className="system-state__card" role="alert">
        <div className={`system-state__icon system-state__icon--${variant}`} aria-hidden="true">
          {variant === "not-found" ? "?" : variant === "offline" ? "×" : "!"}
        </div>

        <p className="system-state__eyebrow">{labels[variant]}</p>
        <h1>{title}</h1>
        <p className="system-state__message">{message}</p>

        <div className="system-state__actions">
          {onRetry && (
            <button type="button" className="system-state__retry" onClick={onRetry}>
              Try Again <span aria-hidden="true">↻</span>
            </button>
          )}
          <Link className="system-state__home" to="/">
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
