import { useState } from "react";
import { NavLink } from "react-router-dom";

import "./AppHeader.css";

const navigationItems = [
  { to: "/", label: "Home" },
  { to: "/how-to-play", label: "Play" },
  { to: "/about", label: "About" },
  { to: "/settings", label: "Settings" },
];

function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <NavLink to="/" className="app-brand" aria-label="Mystery Room home" onClick={() => setIsMenuOpen(false)}>
          <span className="app-brand__mark" aria-hidden="true">⌕</span>
          <span className="app-brand__text"><span>MYSTERY</span><span>ROOM</span></span>
        </NavLink>

        <nav id="main-navigation" className={`app-navigation ${isMenuOpen ? "app-navigation--open" : ""}`} aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) =>
              `app-navigation__link ${isActive ? "app-navigation__link--active" : ""}`
            } onClick={() => setIsMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="app-header__menu" type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen} aria-controls="main-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;