import { Router } from "express";
import {
  getMysteries,
  getMysteryById,
  submitAnswer,
  requestHint,
} from "../controllers/mystery.controller.js";

const router = Router();

router.get("/", getMysteries);
router.get("/:id", getMysteryById);
router.post("/:id/questions/:questionId/answer", submitAnswer);
router.patch("/:id/questions/:questionId/hint", requestHint);

export default router;
