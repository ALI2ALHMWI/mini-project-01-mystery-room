export function normalizeAnswer(answer) {
  return answer.trim().toLowerCase();
}

export function checkAnswer(userAnswer, correctAnswer) {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}
