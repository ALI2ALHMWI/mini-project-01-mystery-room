import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppHeader from "../components/layout/AppHeader";
import Home from "../pages/Home";
import HowToPlay from "../pages/HowToPlay";
import Result from "../pages/Result";
import MysteryPage from "../pages/Mystery/MysteryPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <AppHeader />

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
