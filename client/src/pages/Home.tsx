import { Link } from "react-router-dom";

function Home() {
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
      </section>
    </main>
  );
}

export default Home;
