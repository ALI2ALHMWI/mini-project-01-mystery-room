// server/src/controllers/mystery.controller.js

import mysteries from "../data/mysteries.js";
import gameState from "../data/gameState.js";
import {
  validateAnswerRequest,
  validateRequiredId,
} from "../utils/validation.js";
import { checkAnswer } from "../utils/answerChecker.js";

const MAX_HINTS = 2;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function findMystery(mysteryId) {
  return mysteries.find((m) => m.id === mysteryId);
}

function findQuestion(mystery, questionId) {
  const numericId = Number(questionId);
  return mystery.questions.find((q) => q.id === numericId);
}

function getOrderedQuestions(mystery) {
  return [...mystery.questions].sort((a, b) => a.order - b.order);
}

/**
 * Public shape of a question (no answer, no hint text).
 */
function toPublicQuestion(question) {
  return {
    id: question.id,
    order: question.order,
    text: question.text,
    maxHints: MAX_HINTS,
  };
}

/**
 * Public shape of a mystery.
 * Reveal fields are only included after the mystery is completed.
 * Game-state fields are safe to expose (no answers, no hint text).
 */
function toPublicMystery(mystery, state) {
  const base = {
    id: mystery.id,
    title: mystery.title,
    description: mystery.description,
    story: mystery.story,
    questions: getOrderedQuestions(mystery).map(toPublicQuestion),

    // Expose game state so the frontend survives a page refresh
    currentQuestionId: state?.currentQuestionId ?? null,
    completed: state?.completed ?? false,
    hintsUsed: { ...(state?.hintsUsed ?? {}) }, // copy, never leak the live object
  };

  // Reveal only after completion
  if (state && state.completed) {
    base.finalReveal = mystery.finalReveal;
    base.nextMysteryId = mystery.nextMysteryId ?? null;
  }

  return base;
}

/**
 * Public shape of a mystery list item (collection view).
 */
function toPublicMysteryListItem(mystery) {
  return {
    id: mystery.id,
    title: mystery.title,
    description: mystery.description,
  };
}

/**
 * Lazily create runtime state for a mystery on first access.
 * Returns null if the mystery does not exist.
 */
function ensureMysteryState(mysteryId) {
  if (!gameState.mysteries[mysteryId]) {
    const mystery = findMystery(mysteryId);
    if (!mystery) return null;

    const ordered = getOrderedQuestions(mystery);
    gameState.mysteries[mysteryId] = {
      currentQuestionId: ordered[0]?.id ?? null,
      solvedQuestionIds: [],
      hintsUsed: {},
      completed: false,
    };
  }
  return gameState.mysteries[mysteryId];
}

/* ------------------------------------------------------------------ */
/* GET /api/mysteries                                                  */
/* ------------------------------------------------------------------ */

export function getMysteries(req, res) {
  const list = mysteries.map(toPublicMysteryListItem);
  return res.status(200).json(list);
}

/* ------------------------------------------------------------------ */
/* GET /api/mysteries/:id                                              */
/* ------------------------------------------------------------------ */

export function getMysteryById(req, res) {
  const idCheck = validateRequiredId(req.params.id, "Mystery ID");
  if (!idCheck.valid) {
    return res.status(400).json({ message: idCheck.message });
  }

  const mystery = findMystery(req.params.id);
  if (!mystery) {
    return res.status(404).json({ message: "Mystery not found." });
  }

  const state = ensureMysteryState(mystery.id);
  return res.status(200).json(toPublicMystery(mystery, state));
}

/* ------------------------------------------------------------------ */
/* POST /api/mysteries/:id/questions/:questionId/answer                */
/* ------------------------------------------------------------------ */

export function submitAnswer(req, res) {
  const bodyCheck = validateAnswerRequest(req.body);
  if (!bodyCheck.valid) {
    return res.status(400).json({ message: bodyCheck.message });
  }

  const idCheck = validateRequiredId(req.params.id, "Mystery ID");
  if (!idCheck.valid) {
    return res.status(400).json({ message: idCheck.message });
  }
  const qIdCheck = validateRequiredId(req.params.questionId, "Question ID");
  if (!qIdCheck.valid) {
    return res.status(400).json({ message: qIdCheck.message });
  }

  const mystery = findMystery(req.params.id);
  if (!mystery) {
    return res.status(404).json({ message: "Mystery not found." });
  }

  const question = findQuestion(mystery, req.params.questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found." });
  }

  const state = ensureMysteryState(mystery.id);

  if (state.completed) {
    return res.status(400).json({
      message: "Mystery has already been completed.",
    });
  }

  if (question.id !== state.currentQuestionId) {
    return res.status(400).json({
      message: "This question is not currently available.",
    });
  }

  const isCorrect = checkAnswer(req.body.answer, question.answer);

  if (!isCorrect) {
    return res.status(200).json({
      correct: false,
      message: "Wrong answer. Try again.",
    });
  }

  if (!state.solvedQuestionIds.includes(question.id)) {
    state.solvedQuestionIds.push(question.id);
  }

  const ordered = getOrderedQuestions(mystery);
  const currentIndex = ordered.findIndex((q) => q.id === question.id);
  const nextQuestion = ordered[currentIndex + 1];

  if (nextQuestion) {
    state.currentQuestionId = nextQuestion.id;
    return res.status(200).json({
      correct: true,
      message: "Correct answer.",
      mysteryCompleted: false,
      nextQuestionId: nextQuestion.id,
    });
  }

  state.completed = true;
  state.currentQuestionId = null;

  return res.status(200).json({
    correct: true,
    message: "Correct answer. Mystery completed.",
    mysteryCompleted: true,
    finalReveal: mystery.finalReveal,
    nextMysteryId: mystery.nextMysteryId ?? null,
  });
}

/* ------------------------------------------------------------------ */
/* PATCH /api/mysteries/:id/questions/:questionId/hint                 */
/* ------------------------------------------------------------------ */

export function requestHint(req, res) {
  const idCheck = validateRequiredId(req.params.id, "Mystery ID");
  if (!idCheck.valid) {
    return res.status(400).json({ message: idCheck.message });
  }
  const qIdCheck = validateRequiredId(req.params.questionId, "Question ID");
  if (!qIdCheck.valid) {
    return res.status(400).json({ message: qIdCheck.message });
  }

  const mystery = findMystery(req.params.id);
  if (!mystery) {
    return res.status(404).json({ message: "Mystery not found." });
  }

  const question = findQuestion(mystery, req.params.questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found." });
  }

  const state = ensureMysteryState(mystery.id);

  if (state.completed) {
    return res.status(400).json({
      message: "Mystery has already been completed.",
    });
  }

  if (question.id !== state.currentQuestionId) {
    return res.status(400).json({
      message: "This question is not currently available.",
    });
  }

  const used = state.hintsUsed[question.id] ?? 0;
  if (used >= MAX_HINTS) {
    return res.status(400).json({ message: "No hints remaining." });
  }

  const hint = question.hints[used];
  state.hintsUsed[question.id] = used + 1;

  return res.status(200).json({
    hint,
    hintsRemaining: MAX_HINTS - (used + 1),
  });
}