import { Link } from "react-router-dom";

import "./Settings.css";

function Settings() {
  return (
    <main className="settings-page">
      <section className="settings-page__container container">
        <div className="settings-page__header">
          <span className="settings-page__eyebrow">Preferences</span>
          <h1>Settings</h1>
          <p>Manage the visual preferences for your mystery experience.</p>
        </div>

        <section className="settings-card">
          <div className="settings-row">
            <div>
              <h2>Dark atmosphere</h2>
              <p>The Mystery Room experience uses the dark visual theme.</p>
            </div>

            <span className="settings-badge">Enabled</span>
          </div>

          <div className="settings-row">
            <div>
              <h2>Sound effects</h2>
              <p>Sound preferences will be available in a future version.</p>
            </div>

            <span className="settings-badge settings-badge--muted">
              Coming soon
            </span>
          </div>

          <div className="settings-row">
            <div>
              <h2>Progress</h2>
              <p>Your current progress is managed by the game backend.</p>
            </div>

            <span className="settings-badge settings-badge--muted">
              Backend
            </span>
          </div>
        </section>

        <Link className="settings-page__back-link" to="/">
          <span aria-hidden="true">←</span>
          Back Home
        </Link>
      </section>
    </main>
  );
}

export default Settings;
