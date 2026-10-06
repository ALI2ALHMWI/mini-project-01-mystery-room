import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { SoundProvider } from "./context/SoundContext.tsx";

import "./styles/global.css";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NotificationProvider>
      <SoundProvider>
        <App />
      </SoundProvider>
    </NotificationProvider>
  </StrictMode>,
);
