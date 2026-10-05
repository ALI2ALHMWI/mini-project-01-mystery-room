import { Link } from "react-router-dom";

import "./About.css";

const features = [
  "Multiple mysterious rooms",
  "Interactive questions and hints",
  "Backend-driven progress tracking",
  "Responsive desktop and mobile design",
];

function About() {
  return (
    <main className="about-page">
      <section className="about-page__container container">
        <div className="about-page__header">
          <span className="about-page__eyebrow">The experience</span>

          <h1>About Mystery Room</h1>

          <p>
            Mystery Room is an interactive puzzle experience where you explore
            hidden rooms, investigate clues, and uncover the truth one answer at
            a time.
          </p>
        </div>

        <div className="about-page__content">
          <section className="about-card">
            <span className="about-card__icon" aria-hidden="true">
              ?
            </span>

            <h2>A mystery built for discovery</h2>

            <p>
              Every room contains details that matter. Read carefully, think
              logically, use hints when necessary, and solve each question in
              the correct order.
            </p>
          </section>

          <section className="about-card">
            <span className="about-card__icon" aria-hidden="true">
              ✓
            </span>

            <h2>Game Features</h2>

            <ul className="about-features">
              {features.map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <Link className="about-page__back-link" to="/">
          <span aria-hidden="true">←</span>
          Back Home
        </Link>
      </section>
    </main>
  );
}

export default About;
