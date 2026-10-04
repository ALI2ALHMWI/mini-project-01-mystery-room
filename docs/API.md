# Mystery Room API

## 1. Overview

The Mystery Room backend provides the API used by the React frontend to load mysteries, submit free-text answers, progress through questions, request hints, and unlock the next mystery.

The backend is the source of truth for:

- Correct answers.
- Question order.
- Hint usage.
- Mystery completion.
- Mystery locking and unlocking.
- Final reveals.

The frontend must never receive hidden solution data before it is needed.

The API uses:

```text
Node.js
Express
In-memory runtime state
```

There is no database, authentication, session, cookie, or user account requirement in this project.

---

## 2. Base URL

During local development:

```text
http://localhost:5000
```

API base path:

```text
/api
```

All mystery endpoints start with:

```text
/api/mysteries
```

---

## 3. Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/mysteries` | Get mystery cards and unlock status |
| GET | `/api/mysteries/:id` | Get one unlocked mystery and current public gameplay state |
| POST | `/api/mysteries/:id/questions/:questionId/answer` | Submit one free-text answer |
| PATCH | `/api/mysteries/:id/questions/:questionId/hint` | Request the next hint |

---

## 4. Answer Input Rule

The player answer is always entered as free text.

The frontend must send:

```json
{
  "answer": "player typed answer"
}
```

The question response must not include:

- `options`.
- `choices`.
- `answer`.
- Any field that reveals the correct answer.

The UI must use a normal text input. This API does not support multiple-choice answer submission.

---

# 5. GET `/api/mysteries`

Returns the available mystery cards and whether each mystery is currently unlocked.

## Request

```http
GET /api/mysteries
```

## Success Response

Status:

```text
200 OK
```

Example:

```json
[
  {
    "id": "mystery-1",
    "title": "The Missing Key",
    "description": "A temporary mystery used for API testing.",
    "unlocked": true
  },
  {
    "id": "mystery-2",
    "title": "The Silent Library",
    "description": "A second temporary mystery used for API testing.",
    "unlocked": false
  }
]
```

## Information restrictions

The collection response must not expose:

- Correct answers.
- Hint text.
- Final reveal text.
- Internal runtime state.

The first mystery is unlocked by default. Later mysteries become unlocked after the previous mystery is completed.

---

# 6. GET `/api/mysteries/:id`

Returns one unlocked mystery with its public story, question data, and current gameplay state.

## Request

```http
GET /api/mysteries/mystery-1
```

## Success Response

Status:

```text
200 OK
```

Example:

```json
{
  "id": "mystery-1",
  "title": "The Missing Key",
  "description": "A temporary mystery used for API testing.",
  "story": "You enter an old room and discover that the main door is locked.",
  "questions": [
    {
      "id": 1,
      "order": 1,
      "text": "What follows you when there is light?",
      "maxHints": 2
    },
    {
      "id": 2,
      "order": 2,
      "text": "What can open something that is locked?",
      "maxHints": 2
    }
  ],
  "currentQuestionId": 1,
  "completed": false,
  "hintsUsed": {}
}
```

## Public question contract

Each public question contains only:

```text
id
order
text
maxHints
```

It must not contain:

```text
answer
hints
options
choices
```

`finalReveal` and `nextMysteryId` are returned only after the mystery is completed.

---

## 6.1 Mystery Not Found

Request:

```http
GET /api/mysteries/not-found
```

Response:

```text
404 Not Found
```

```json
{
  "message": "Mystery not found."
}
```

## 6.2 Mystery Locked

If the mystery exists but is not unlocked:

```text
403 Forbidden
```

```json
{
  "message": "Mystery is locked."
}
```

---

# 7. POST `/api/mysteries/:id/questions/:questionId/answer`

Submits the player's free-text answer for the currently active question.

## Request

```http
POST /api/mysteries/mystery-1/questions/1/answer
Content-Type: application/json
```

```json
{
  "answer": "shadow"
}
```

The answer value must be a string. The client may trim whitespace before sending, but the backend must also normalize safely.

---

# 8. Answer Rules

Answers are case-insensitive and should ignore leading and trailing whitespace.

These values represent the same answer:

```text
shadow
Shadow
SHADOW
sHaDoW
  shadow  
```

The backend performs the final comparison. The frontend must not contain the correct answer or duplicate the answer-checking logic.

---

# 9. Correct Answer with More Questions

If the answer is correct and more questions remain:

Status:

```text
200 OK
```

Response:

```json
{
  "correct": true,
  "message": "Correct answer.",
  "mysteryCompleted": false,
  "nextQuestionId": 2
}
```

The backend updates runtime state so Question 2 becomes current.

---

# 10. Correct Answer Completing a Mystery

If the player correctly answers the final question:

Status:

```text
200 OK
```

Response:

```json
{
  "correct": true,
  "message": "Correct answer. Mystery completed.",
  "mysteryCompleted": true,
  "finalReveal": "You discovered the hidden key and escaped the room.",
  "nextMysteryId": "mystery-2"
}
```

If no mystery remains:

```json
{
  "correct": true,
  "message": "Correct answer. Mystery completed.",
  "mysteryCompleted": true,
  "finalReveal": "You solved the final mystery.",
  "nextMysteryId": null
}
```

The frontend may navigate to the result page after receiving this response.

---

# 11. Wrong Answer

A wrong answer is a valid gameplay result, not a request error.

Status:

```text
200 OK
```

Response:

```json
{
  "correct": false,
  "message": "Wrong answer. Try again."
}
```

The current question does not change.

---

# 12. Invalid Answer Request

The following are invalid:

### Missing answer

```json
{}
```

### Wrong type

```json
{
  "answer": 123
}
```

### Empty string

```json
{
  "answer": ""
}
```

### Whitespace-only string

```json
{
  "answer": "   "
}
```

Response:

```text
400 Bad Request
```

```json
{
  "message": "Answer is required and must be a non-empty string."
}
```

---

# 13. Question Not Found

If the mystery exists but the question does not:

```http
POST /api/mysteries/mystery-1/questions/999/answer
```

Response:

```text
404 Not Found
```

```json
{
  "message": "Question not found."
}
```

---

# 14. Question Order

Questions must be answered in order.

If Question 1 is active, submitting an answer for Question 2 is invalid:

```text
400 Bad Request
```

```json
{
  "message": "This question is not currently available."
}
```

The frontend must render only the current question, but the backend must enforce this rule independently.

---

# 15. PATCH `/api/mysteries/:id/questions/:questionId/hint`

Requests the next available hint for the currently active question.

## Request

```http
PATCH /api/mysteries/mystery-1/questions/1/hint
```

No request body is required.

## First Hint

```text
200 OK
```

```json
{
  "hint": "Think about something that follows you.",
  "hintsRemaining": 1
}
```

## Second Hint

```text
200 OK
```

```json
{
  "hint": "You can see it when there is light.",
  "hintsRemaining": 0
}
```

The frontend must display only the hint returned by this endpoint.

---

# 16. Hint Errors

Each question allows a maximum of two hints.

A third request returns:

```text
400 Bad Request
```

```json
{
  "message": "No hints remaining."
}
```

A hint for a non-current question returns:

```text
400 Bad Request
```

```json
{
  "message": "This question is not currently available."
}
```

A hint after completion returns:

```text
400 Bad Request
```

```json
{
  "message": "Mystery has already been completed."
}
```

---

# 17. Runtime State

Runtime state is separate from static mystery data.

```text
gameState
└── mysteries
    └── mystery-1
        ├── currentQuestionId
        ├── solvedQuestionIds
        ├── hintsUsed
        └── completed
```

Example:

```json
{
  "mysteries": {
    "mystery-1": {
      "currentQuestionId": 2,
      "solvedQuestionIds": [1],
      "hintsUsed": {
        "1": 1
      },
      "completed": false
    }
  }
}
```

---

# 18. Static Data vs Runtime State

Static mystery data contains:

```text
id
title
description
story
questions
answers
hints
finalReveal
nextMysteryId
```

Runtime state contains:

```text
currentQuestionId
solvedQuestionIds
hintsUsed
completed
```

Correct answers and actual hint text remain backend-only until the appropriate action occurs.

---

# 19. Information Exposure Rules

The safe gameplay sequence is:

```text
GET mystery
      ↓
Public question text only
      ↓
Player types a free-text answer
      ↓
POST answer
      ↓
Correct or wrong result
      ↓
Player requests a hint if needed
      ↓
PATCH hint
      ↓
One hint returned
```

The normal mystery response must not contain the answer, hint arrays, answer options, or final reveal before completion.

---

# 20. Frontend API Layer

All React requests go through:

```text
client/src/services/api.ts
```

Required functions:

```ts
getMysteries()
getMysteryById(id)
submitAnswer(mysteryId, questionId, answer)
requestHint(mysteryId, questionId)
```

`submitAnswer` accepts a string:

```ts
submitAnswer(
  mysteryId: string,
  questionId: number,
  answer: string,
): Promise<AnswerResponse>
```

The service is responsible for:

- Building URLs.
- Encoding route IDs.
- Sending JSON for answer requests.
- Parsing JSON.
- Converting non-2xx responses into `ApiError`.
- Returning typed response data.

Components must not call `fetch` directly.

---

# 21. Error Handling Contract

The frontend must handle at least:

```text
200 → Render the gameplay result.
400 → Show validation or gameplay feedback.
403 → Show that the mystery is locked.
404 → Show that the mystery or question was not found.
500/network failure → Show a recoverable error state.
```

The user should never see a blank page because of an API failure.

---

# 22. Independent API Testing

Test the backend without the React frontend using curl, Postman, or Thunder Client.

Minimum test cases:

```text
GET collection
GET valid unlocked mystery
GET invalid mystery
GET locked mystery
POST correct free-text answer
POST wrong free-text answer
POST answer with different casing
POST answer with surrounding whitespace
POST missing answer
POST non-string answer
POST empty answer
POST wrong question order
PATCH first hint
PATCH second hint
PATCH third hint
PATCH hint for wrong question
PATCH invalid question
POST after mystery completion
```

---

# 23. Contract Change Rule

If an endpoint or response shape changes:

1. Discuss the change with the team.
2. Update this `API.md`.
3. Update the backend implementation.
4. Update `client/src/services/api.ts`.
5. Update `client/src/types/mystery.types.ts`.
6. Update the relevant task and structure documentation.
7. Run independent endpoint tests.
8. Run the frontend lint and build checks.

Do not silently change an API response and expect the other side to discover it later.
