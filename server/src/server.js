import express from "express";
import cors from "cors";
import mysteryRoutes from "./routes/mystery.routes.js";

const PORT = process.env.PORT || 5000;

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/mysteries", mysteryRoutes);

app.use("/api", (req, res) =>
  res.status(404).json({ message: "API endpoint not found." }),
);

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) return next(error);

  return res.status(500).json({ message: "Internal server error." });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
