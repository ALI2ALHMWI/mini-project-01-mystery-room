import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useSound } from "../context/SoundContext";

import { ApiError, getMysteries } from "../services/api";
import type { MysteryListItem } from "../types/mystery.types";

import heroImage from "../assets/generated/mystery-hero-door.jpg";

import "./Home.css";

function Home() {
  const [mysteries, setMysteries] = useState<MysteryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { startAmbient } = useSound();

  const loadMysteries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMysteries();
      setMysteries(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load mysteries. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMysteries();
  }, [loadMysteries]);

  const firstUnlockedMystery = mysteries.find((mystery) => mystery.unlocked);

  return (
    <main className="home-page">
      <section className="home-hero container">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">A cinematic mystery experience</p>

          <h1 className="home-hero__title">
            Can you solve
            <span>the mystery?</span>
          </h1>

          <p className="home-hero__description">
            Explore hidden rooms, find clues, answer questions, and uncover the
            truth one mystery at a time.
          </p>

          <div className="home-hero__actions">
            {firstUnlockedMystery ? (
              <Link
                className="button button--primary"
                to={`/mystery/${encodeURIComponent(firstUnlockedMystery.id)}`}
                onClick={startAmbient}
              >
                Start Playing
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <Link className="button button--primary" to="/how-to-play" onClick={startAmbient}>
                Start Playing
                <span aria-hidden="true">→</span>
              </Link>
            )}

            <Link className="button button--secondary" to="/how-to-play">
              Learn More
            </Link>
          </div>
        </div>

        <div className="home-hero__visual">
          <img
            src={heroImage}
            alt="An old mysterious door glowing with warm light"
          />

          <div className="home-hero__visual-overlay" />
          <div className="home-hero__visual-glow" />
        </div>
      </section>

      <section className="mysteries-section container">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Choose your adventure</p>
            <h2>Enter a mystery room</h2>
          </div>

          <span className="section-heading__line" />
        </div>

        {isLoading && (
          <div className="home-state">
            <span className="home-state__spinner" />
            <p>Loading mysteries...</p>
          </div>
        )}

        {error && (
          <div className="home-state home-state--error" role="alert">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && mysteries.length === 0 && (
          <div className="home-state">
            <p>No mysteries are available right now.</p>
          </div>
        )}

        {!isLoading && !error && mysteries.length > 0 && (
          <div className="mysteries-grid">
            {mysteries.map((mystery, index) => (
              <article
                className={`mystery-card ${
                  mystery.unlocked ? "" : "mystery-card--locked"
                }`}
                key={mystery.id}
              >
                <div className="mystery-card__number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="mystery-card__content">
                  <span className="mystery-card__status">
                    {mystery.unlocked ? "Available" : "Locked"}
                  </span>

                  <h3>{mystery.title}</h3>
                  <p>{mystery.description}</p>

                  {mystery.unlocked ? (
                    <Link
                      className="mystery-card__link"
                      to={`/mystery/${encodeURIComponent(mystery.id)}`}
                    >
                      Enter Room
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span className="mystery-card__locked-label">
                      Complete the previous room
                    </span>
                  )}
                </div>

                {!mystery.unlocked && (
                  <span className="mystery-card__lock" aria-hidden="true">
                    🔒
                  </span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;
