import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Home from "../pages/Home";
import HowToPlay from "../pages/HowToPlay";
import Result from "../pages/Result";
import MysteryPage from "../pages/Mystery/MysteryPage";
function AppRouter() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <NavLink className="app-logo" to="/">
          MYSTERY ROOM
        </NavLink>

        <nav className="app-navigation">
          <NavLink to="/">Home</NavLink>

          <NavLink to="/how-to-play">How To Play</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/mystery/:id" element={<MysteryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
