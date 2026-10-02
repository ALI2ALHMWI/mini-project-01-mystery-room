const ANSWER_ERROR_MESSAGE =
  "Answer is required and must be a non-empty string.";

export function validateAnswer(answer) {
  if (typeof answer !== "string" || answer.trim() === "") {
    return {
      valid: false,
      message: ANSWER_ERROR_MESSAGE,
    };
  }

  return {
    valid: true,
    message: null,
  };
}

export function validateRequiredId(id, fieldName = "ID") {
  if (
    id === undefined ||
    id === null ||
    (typeof id === "string" && id.trim() === "")
  ) {
    return {
      valid: false,
      message: `${fieldName} is required.`,
    };
  }

  return {
    valid: true,
    message: null,
  };
}

export function validateAnswerRequest(body) {
  return validateAnswer(body?.answer);
}
