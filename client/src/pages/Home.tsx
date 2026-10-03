
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, getMysteries } from "../services/api.ts";
import type { MysteryListItem } from "../types/mystery.types.ts";

function Home() {
  const [mysteries, setMysteries] = useState<MysteryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;

    getMysteries()
      .then((data) => {
        if (!isCurrentRequest) return;
        setMysteries(data);
      })
      .catch((err: unknown) => {
        if (!isCurrentRequest) return;

        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Unable to load mysteries. Please try again.");
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
  }, []);

  return (
    <main className="home-page">
      <section className="home-content">
        <h1>Mystery Room</h1>

        <p>
          Enter a mystery, investigate the story and clues, and solve the
          questions step by step.
        </p>

        <nav className="home-actions">
          <Link className="primary-button" to="/how-to-play">
            How To Play
          </Link>
        </nav>

        <section className="mysteries-section">
          <h2>Choose Your Mystery</h2>

          {isLoading && <p>Loading mysteries...</p>}

          {error && (
            <p role="alert">
              {error}
            </p>
          )}

          {!isLoading && !error && mysteries.length === 0 && (
            <p>No mysteries are available right now.</p>
          )}

          {!isLoading && !error && mysteries.length > 0 && (
            <div className="mysteries-list">
              {mysteries.map((mystery) => (
                <article
                  className={`mystery-card ${
                    mystery.unlocked ? "" : "mystery-card--locked"
                  }`}
                  key={mystery.id}
                >
                  <h3>{mystery.title}</h3>

                  <p>{mystery.description}</p>

                  {mystery.unlocked ? (
                    <Link
                      className="primary-button"
                      to={`/mystery/${encodeURIComponent(mystery.id)}`}
                    >
                      Enter Mystery
                    </Link>
                  ) : (
                    <button
                      className="primary-button"
                      type="button"
                      disabled
                    >
                      Locked
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Home;

