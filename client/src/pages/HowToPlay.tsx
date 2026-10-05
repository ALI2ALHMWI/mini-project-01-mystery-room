import { Link } from "react-router-dom";
import "./HowToPlay.css";

function HowToPlay() {
  return (
    <main className="how-to-play-page">
      <section className="how-to-play-card">
        <h1>How To Play</h1>

        <ul className="rules-list">
          <li>Solve questions in order.</li>
          <li>Each question has one answer.</li>
          <li>Answers are case-insensitive.</li>
          <li>Each question allows a maximum of 2 hints.</li>
          <li>Wrong answers allow you to retry.</li>
          <li>Correct answers unlock the next question.</li>
          <li>Completing a mystery unlocks the next mystery.</li>
        </ul>

        <Link className="primary-button" to="/">
          Back Home
        </Link>
      </section>
    </main>
  );
}

export default HowToPlay;
