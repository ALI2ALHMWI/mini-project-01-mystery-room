# Mystery Room API

## 1. Overview

The Mystery Room API powers the React frontend and is the source of truth for mystery progression.

The backend owns:

- mystery content
- correct answers
- hidden hints
- question order
- hint usage
- mystery completion
- mystery unlocking
- final reveals

The API uses Node.js, Express, and in-memory runtime state. No authentication, database, sessions, or user accounts are required.

## 2. Base URL

Local development:

```text
http://localhost:5000
```

API prefix:

```text
/api
```

All mystery routes are under:

```text
/api/mysteries
```

## 3. Endpoint Summary

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/mysteries` | Public mystery list and unlock status |
| GET | `/api/mysteries/:id` | Public data and current state for an unlocked mystery |
| POST | `/api/mysteries/:id/questions/:questionId/answer` | Submit a free-text answer |
| PATCH | `/api/mysteries/:id/questions/:questionId/hint` | Request the next hint |

## 4. Public Data Rules

A public question contains only:

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

Before completion, a mystery response must not contain `finalReveal` or `nextMysteryId`.

The backend therefore remains the authority for all hidden solution information.

## 5. GET /api/mysteries

Returns all mystery cards.

### Success

```http
GET /api/mysteries
```

```json
[
  {
    "id": "mystery-1",
    "title": "The Five O'Clock Coffee",
    "description": "A businessman dies seconds after drinking coffee. The timeline points to something that was added after the coffee was poured.",
    "unlocked": true
  },
  {
    "id": "mystery-2",
    "title": "The Rainy Gallery",
    "description": "A valuable painting disappears during a storm. One suspect's story conflicts with a physical detail at the scene.",
    "unlocked": false
  }
]
```

The first mystery is always unlocked. Each later mystery becomes unlocked when the previous mystery is completed.

## 6. GET /api/mysteries/:id

Returns an unlocked mystery with its public story, questions, and current runtime state.

### Example

```http
GET /api/mysteries/mystery-1
```

```json
{
  "id": "mystery-1",
  "title": "The Five O'Clock Coffee",
  "description": "A businessman dies seconds after drinking coffee. The timeline points to something that was added after the coffee was poured.",
  "story": "At 4:59 PM, wealthy businessman Daniel Reed takes one final sip...",
  "questions": [
    {
      "id": 1,
      "order": 1,
      "text": "Who was the last person to handle the cup before Daniel drank the coffee?",
      "maxHints": 2
    }
  ],
  "currentQuestionId": 1,
  "completed": false,
  "hintsUsed": {}
}
```

When completed, the response may additionally contain:

```json
{
  "finalReveal": "The poison was hidden inside the ice cubes...",
  "nextMysteryId": "mystery-2"
}
```

## 6.1 Mystery Not Found

```http
GET /api/mysteries/not-found
```

Returns:

```text
404 Not Found
```

```json
{
  "message": "Mystery not found."
}
```

## 6.2 Mystery Locked

An existing mystery that has not been unlocked returns:

```text
403 Forbidden
```

```json
{
  "message": "Mystery is locked."
}
```

## 7. POST /api/mysteries/:id/questions/:questionId/answer

Submits the player's free-text answer for the active question.

### Request

```http
POST /api/mysteries/mystery-1/questions/1/answer
Content-Type: application/json
```

```json
{
  "answer": "the server"
}
```

### Answer normalization

The backend trims leading/trailing whitespace and compares answers case-insensitively.

For example:

```text
the server
The Server
THE SERVER
  the server
```

are equivalent.

The frontend does not contain the correct answer and does not duplicate this comparison logic.

## 8. Wrong Answer

A wrong answer is a valid gameplay result.

```text
200 OK
```

```json
{
  "correct": false,
  "message": "Wrong answer. Try again."
}
```

The current question remains active.

## 9. Correct Answer — More Questions

```text
200 OK
```

```json
{
  "correct": true,
  "message": "Correct answer.",
  "mysteryCompleted": false,
  "nextQuestionId": 2
}
```

The backend advances the runtime state to the next ordered question.

## 10. Correct Answer — Mystery Completed

When the final question is correct:

```text
200 OK
```

```json
{
  "correct": true,
  "message": "Correct answer. Mystery completed.",
  "mysteryCompleted": true,
  "finalReveal": "The poison was hidden inside the ice cubes...",
  "nextMysteryId": "mystery-2"
}
```

For the final mystery, `nextMysteryId` is `null`.

The frontend may navigate to `/result/:id`.

## 11. Invalid Answer Request

The following return `400 Bad Request`:

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

### Empty or whitespace-only answer

```json
{
  "answer": "   "
}
```

Expected response:

```json
{
  "message": "Answer is required and must be a non-empty string."
}
```

## 12. Question Not Found

```http
POST /api/mysteries/mystery-1/questions/999/answer
```

Returns:

```text
404 Not Found
```

```json
{
  "message": "Question not found."
}
```

## 13. Question Order

Only the current question can be answered.

If Question 1 is active and Question 2 is submitted:

```text
400 Bad Request
```

```json
{
  "message": "This question is not currently available."
}
```

The backend enforces this rule even if a client attempts to bypass the UI.

## 14. PATCH /api/mysteries/:id/questions/:questionId/hint

Requests the next available hint for the active question.

No request body is required.

### First hint

```text
200 OK
```

```json
{
  "hint": "Use the timeline. Compare the time each person entered the office.",
  "hintsRemaining": 1
}
```

### Second hint

```text
200 OK
```

```json
{
  "hint": "The last person to touch the cup was the person who added something to it at 4:45 PM.",
  "hintsRemaining": 0
}
```

The frontend displays only the hint returned by this request.

## 15. Hint Errors

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

```json
{
  "message": "This question is not currently available."
}
```

A hint after completion returns:

```json
{
  "message": "Mystery has already been completed."
}
```

## 16. Runtime State

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

This state is in memory and resets when the server restarts.

## 17. Static Data vs Runtime State

Static data in `server/src/data/mysteries.js` contains:

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

Runtime state in `server/src/data/gameState.js` contains:

```text
currentQuestionId
solvedQuestionIds
hintsUsed
completed
```

## 18. Error Contract

| Status | Meaning |
| --- | --- |
| 200 | Successful request or valid wrong-answer result |
| 400 | Invalid input or invalid gameplay action |
| 403 | Mystery exists but is locked |
| 404 | Mystery, question, or API endpoint does not exist |
| 500 | Unexpected server error |

The frontend API layer additionally converts network failures into a recoverable `ApiError`.

## 19. Frontend API Service

All React requests go through:

```text
client/src/services/api.ts
```

Functions:

```ts
getMysteries()
getMysteryById(id)
submitAnswer(mysteryId, questionId, answer)
requestHint(mysteryId, questionId)
```

The service is responsible for:

- building URLs
- encoding IDs
- sending JSON for answers
- parsing responses
- converting non-2xx responses to `ApiError`
- returning typed data

UI components must not call `fetch` directly.

## 20. Testing Checklist

At minimum verify:

- collection request
- valid unlocked mystery
- locked mystery
- missing mystery
- missing question
- correct answer
- wrong answer
- answer casing
- answer whitespace
- missing answer
- invalid answer type
- question skipping
- first hint
- second hint
- third hint
- hint for wrong question
- hint after completion
- completion and final reveal
- next mystery unlocking
- API/network failure handling

## 21. Contract Change Rule

When an endpoint or response shape changes:

1. Update the backend.
2. Update this `docs/API.md`.
3. Update `client/src/services/api.ts`.
4. Update `client/src/types/mystery.types.ts`.
5. Update `docs/PROJECT-STRUCTURE.md` when architecture changes.
6. Run the available frontend build and backend checks.

Do not silently change an API response shape.
