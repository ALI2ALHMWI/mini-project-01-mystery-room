import test from "node:test";
import assert from "node:assert/strict";

import gameState from "../data/gameState.js";
import {
  getMysteries,
  getMysteryById,
  submitAnswer,
  requestHint,
} from "./mystery.controller.js";

function mockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function resetState() {
  gameState.mysteries = {};
}

function call(handler, req) {
  const res = mockResponse();
  handler(req, res);
  return res;
}

test("Mystery Room gameplay and information-exposure contract", () => {
  resetState();

  const collection = call(getMysteries, { params: {} });
  assert.equal(collection.statusCode, 200);
  assert.equal(collection.body.length, 3);
  assert.equal(collection.body[0].unlocked, true);
  assert.equal(collection.body[1].unlocked, false);
  assert.equal("answer" in collection.body[0], false);
  assert.equal("hints" in collection.body[0], false);
  assert.equal("finalReveal" in collection.body[0], false);

  const mystery = call(getMysteryById, { params: { id: "mystery-1" } });
  assert.equal(mystery.statusCode, 200);
  assert.equal(mystery.body.currentQuestionId, 1);
  assert.equal(mystery.body.questions[0].maxHints, 2);
  assert.equal("answer" in mystery.body.questions[0], false);
  assert.equal("hints" in mystery.body.questions[0], false);
  assert.equal("finalReveal" in mystery.body, false);

  const locked = call(getMysteryById, { params: { id: "mystery-2" } });
  assert.equal(locked.statusCode, 403);

  const missing = call(getMysteryById, { params: { id: "does-not-exist" } });
  assert.equal(missing.statusCode, 404);

  const invalidAnswer = call(submitAnswer, {
    params: { id: "mystery-1", questionId: "1" },
    body: {},
  });
  assert.equal(invalidAnswer.statusCode, 400);

  const wrong = call(submitAnswer, {
    params: { id: "mystery-1", questionId: "1" },
    body: { answer: "wrong answer" },
  });
  assert.equal(wrong.statusCode, 200);
  assert.equal(wrong.body.correct, false);
  assert.equal(gameState.mysteries["mystery-1"].currentQuestionId, 1);

  const firstHint = call(requestHint, {
    params: { id: "mystery-1", questionId: "1" },
  });
  assert.equal(firstHint.statusCode, 200);
  assert.equal(firstHint.body.hintsRemaining, 1);
  assert.equal(typeof firstHint.body.hint, "string");

  const secondHint = call(requestHint, {
    params: { id: "mystery-1", questionId: "1" },
  });
  assert.equal(secondHint.statusCode, 200);
  assert.equal(secondHint.body.hintsRemaining, 0);

  const thirdHint = call(requestHint, {
    params: { id: "mystery-1", questionId: "1" },
  });
  assert.equal(thirdHint.statusCode, 400);

  const skip = call(submitAnswer, {
    params: { id: "mystery-1", questionId: "3" },
    body: { answer: "مكعبات الثلج" },
  });
  assert.equal(skip.statusCode, 400);

  const correctOne = call(submitAnswer, {
    params: { id: "mystery-1", questionId: "1" },
    body: { answer: "  الخادم  " },
  });
  assert.equal(correctOne.statusCode, 200);
  assert.equal(correctOne.body.correct, true);
  assert.equal(correctOne.body.nextQuestionId, 2);
  assert.equal(gameState.mysteries["mystery-1"].currentQuestionId, 2);

  const staleHint = call(requestHint, {
    params: { id: "mystery-1", questionId: "1" },
  });
  assert.equal(staleHint.statusCode, 400);

  const correctTwo = call(submitAnswer, {
    params: { id: "mystery-1", questionId: "2" },
    body: { answer: "الثلج" },
  });
  assert.equal(correctTwo.statusCode, 200);
  assert.equal(correctTwo.body.nextQuestionId, 3);

  const correctThree = call(submitAnswer, {
    params: { id: "mystery-1", questionId: "3" },
    body: { answer: "مكعبات الثلج" },
  });
  assert.equal(correctThree.statusCode, 200);
  assert.equal(correctThree.body.mysteryCompleted, true);
  assert.equal(typeof correctThree.body.finalReveal, "string");
  assert.equal(correctThree.body.nextMysteryId, "mystery-2");

  const completed = call(getMysteryById, { params: { id: "mystery-1" } });
  assert.equal(completed.statusCode, 200);
  assert.equal(completed.body.completed, true);
  assert.equal(typeof completed.body.finalReveal, "string");
  assert.equal(completed.body.nextMysteryId, "mystery-2");

  const unlockedNext = call(getMysteryById, { params: { id: "mystery-2" } });
  assert.equal(unlockedNext.statusCode, 200);

  const finalAgain = call(submitAnswer, {
    params: { id: "mystery-1", questionId: "3" },
    body: { answer: "مكعبات الثلج" },
  });
  assert.equal(finalAgain.statusCode, 400);
});
