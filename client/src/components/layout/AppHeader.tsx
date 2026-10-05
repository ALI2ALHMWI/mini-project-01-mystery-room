import { NavLink } from "react-router-dom";
import "./AppHeader.css";

function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <NavLink to="/" className="app-brand" aria-label="Mystery Room home">
          <span className="app-brand__mark" aria-hidden="true">
            ⌕
          </span>

          <span className="app-brand__text">
            <span>MYSTERY</span>
            <span>ROOM</span>
          </span>
        </NavLink>

        <nav className="app-navigation" aria-label="Main navigation">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `app-navigation__link ${
                isActive ? "app-navigation__link--active" : ""
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/how-to-play"
            className={({ isActive }) =>
              `app-navigation__link ${
                isActive ? "app-navigation__link--active" : ""
              }`
            }
          >
            Play
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `app-navigation__link ${
                isActive ? "app-navigation__link--active" : ""
              }`
            }
          >
            About
          </NavLink>
        </nav>

        <button className="app-header__login" type="button">
          Login
        </button>

        <button
          className="app-header__menu"
          type="button"
          aria-label="Open navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
