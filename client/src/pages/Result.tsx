import { Link } from "react-router-dom";

function Result() {
  return (
    <main className="result-page">
      <section className="result-card">
        <h1>Mystery Complete</h1>

        <div className="final-reveal">
          {/* Final reveal comes from the backend completion response */}
        </div>

        <div className="result-actions">
          {/* Next mystery action will use backend completion data when available */}

          <Link className="primary-button" to="/">
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Result;
