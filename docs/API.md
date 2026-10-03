# Mystery Room API

## 1. Overview

The Mystery Room backend provides the API used by the React frontend to load mysteries, submit answers, progress through questions, and request hints.

The backend is the source of truth for the actual mystery state.

The API uses:

```text
Node.js
Express
In-memory runtime state
```

There is no database.

---

# 2. Base URL

During local development:

```text
http://localhost:5000
```

API base path:

```text
/api
```

Therefore, all mystery endpoints start with:

```text
/api/mysteries
```

---

# 3. API Endpoints

| Method | Endpoint                                          | Purpose                 |
| ------ | ------------------------------------------------- | ----------------------- |
| GET    | `/api/mysteries`                                  | Get available mysteries |
| GET    | `/api/mysteries/:id`                              | Get one mystery         |
| POST   | `/api/mysteries/:id/questions/:questionId/answer` | Submit an answer        |
| PATCH  | `/api/mysteries/:id/questions/:questionId/hint`   | Request the next hint   |

---

# 4. GET /api/mysteries

Returns the available mysteries.

## Request

```http
GET /api/mysteries
```

## Response

```json
[
  {
    "id": "mystery-1",
    "title": "The Missing Key",
    "description": "A temporary mystery used for API testing."
  },
  {
    "id": "mystery-2",
    "title": "The Silent Library",
    "description": "A second temporary mystery used for API testing."
  }
]
```

## Important

The collection response must not expose:

- Correct answers
- Hint text
- Internal runtime state

---
# 5. GET /api/mysteries/:id

Returns one specific mystery, including the current game state.


## Request

```http
GET /api/mysteries/mystery-1
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
    },
    {
      "id": 3,
      "order": 3,
      "text": "What do you pass through to enter another room?",
      "maxHints": 2
    }
  ],
  "finalReveal": "You discovered the hidden key and escaped the room.",
  "nextMysteryId": "mystery-2"
}
```

## Important

The response must **not** expose:

```text
answer
```

or:

```text
hint text
```

The frontend only receives the question information and the maximum number of hints.

The actual hint text is revealed only through the hint endpoint.

---

# 6. GET /api/mysteries/:id — Not Found

If the mystery does not exist:

```http
GET /api/mysteries/not-found
```

Response:

Status:

```text
404 Not Found
```

Body:

```json
{
  "message": "Mystery not found."
}
```

The API must not return:

```text
200
```

with an empty or null mystery.

---

# 7. POST /api/mysteries/:id/questions/:questionId/answer

Submits the player's answer for the current question.

## Request

```http
POST /api/mysteries/mystery-1/questions/1/answer
```

Body:

```json
{
  "answer": "shadow"
}
```

---

# 8. Answer Rules

The backend is responsible for checking the answer.

Answers are case-insensitive.

These should all be treated as the same answer:

```text
shadow
Shadow
SHADOW
sHaDoW
```

Leading/trailing whitespace should also be handled appropriately.

---

# 9. Correct Answer

If the answer is correct and there are more questions:

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

The backend updates the runtime state so that Question 2 becomes the current question.

---

# 10. Correct Answer — Mystery Completed

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

If there is no next mystery:

```json
{
  "correct": true,
  "message": "Correct answer. Mystery completed.",
  "mysteryCompleted": true,
  "finalReveal": "You solved the final mystery.",
  "nextMysteryId": null
}
```

---

# 11. Wrong Answer

A wrong answer is a valid gameplay result.

It is therefore **not** a `400` error.

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

The player remains on the same question.

---

# 12. Invalid Answer

The backend must validate the request body.

Invalid examples include:

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

### Whitespace only

```json
{
  "answer": "   "
}
```

These should return:

Status:

```text
400 Bad Request
```

Example response:

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

Example:

```json
{
  "message": "Question not found."
}
```

---

# 14. Question Order

Questions must be solved in order.

Example:

```text
Question 1
    ↓
Question 2
    ↓
Question 3
```

The player cannot submit an answer for Question 3 while Question 1 is still active.

If the player attempts to answer a question that is not currently available:

Status:

```text
400 Bad Request
```

Response:

```json
{
  "message": "This question is not currently available."
}
```

---

# 15. PATCH /api/mysteries/:id/questions/:questionId/hint

Requests the next available hint for the current question.

## Request

```http
PATCH /api/mysteries/mystery-1/questions/1/hint
```

No request body is required.

---

# 16. First Hint

The first request returns the first hint.

Status:

```text
200 OK
```

Example:

```json
{
  "hint": "Think about something that follows you.",
  "hintsRemaining": 1
}
```

---

# 17. Second Hint

The second request returns the second hint.

Status:

```text
200 OK
```

Example:

```json
{
  "hint": "You can see it when there is light.",
  "hintsRemaining": 0
}
```

---

# 18. Third Hint

Each question allows a maximum of two hints.

A third request is invalid.

Status:

```text
400 Bad Request
```

Response:

```json
{
  "message": "No hints remaining."
}
```

---

# 19. Hint for Wrong Question

A player can only request a hint for the currently active question.

For example, if Question 1 is active:

```http
PATCH /api/mysteries/mystery-1/questions/2/hint
```

is invalid.

Response:

```text
400 Bad Request
```

```json
{
  "message": "This question is not currently available."
}
```

---

# 20. Hint After Mystery Completion

If the mystery has already been completed, another hint cannot be requested.

Status:

```text
400 Bad Request
```

Response:

```json
{
  "message": "Mystery has already been completed."
}
```

---

# 21. Runtime State

The backend keeps gameplay state separately from the static mystery data.

Example:

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

# 22. Static Data vs Runtime State

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

These should remain separate.

The backend's static data is the source for mystery content.

The runtime state is the source of truth for current gameplay progress.

---

# 23. API Security / Information Exposure

The frontend must never receive the correct answer as part of the normal mystery response.

The frontend must also not receive all hint text before requesting hints.

Therefore:

```text
GET mystery
      ↓
Question information only
      ↓
Player requests hint
      ↓
PATCH hint
      ↓
One hint returned
```

This prevents the frontend from knowing the solution before the player actually interacts with the game.

---

# 24. Frontend API Layer

All API calls from React should go through:

```text
client/src/services/api.ts
```

Components should not contain scattered direct `fetch()` calls.

Example structure:

```text
components/pages
       ↓
services/api.ts
       ↓
Express API
```

The API layer should expose named functions that match the application's needs.

For example:

```text
getMysteries()
getMysteryById(id)
submitAnswer(mysteryId, questionId, answer)
requestHint(mysteryId, questionId)
```

The exact implementation belongs to the frontend team.

---

# 25. Error Handling

The frontend must handle:

```text
200
400
404
```

without crashing.

Examples:

```text
400 → Show a useful validation/gameplay message
404 → Show that the mystery/question could not be found
Network error → Show a useful error state and recovery option where appropriate
```

The user should never see a blank page because an API request failed.

---

# 26. Independent API Testing

The backend must be testable without the React frontend.

Use one of:

- Postman
- Thunder Client
- curl

At minimum, test:

```text
GET collection
GET valid mystery
GET invalid mystery
POST correct answer
POST wrong answer
POST invalid answer
POST wrong question order
PATCH first hint
PATCH second hint
PATCH third hint
PATCH invalid question
```

---

# 27. API Contract Rule

The frontend and backend team must follow this document.

If an endpoint or response shape needs to change:

1. Discuss the change with the team.
2. Update `API.md`.
3. Update the backend.
4. Update the frontend API layer.
5. Test the changed behavior.

Do not silently change an API response and expect the other side to discover the change later.
