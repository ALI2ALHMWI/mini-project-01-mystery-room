# Mystery Controller Reference

## Purpose

The Mystery Controller is the main backend controller for the Mystery Room gameplay API.

File:

`server/src/controllers/mystery.controller.js`

It is responsible for:

- returning the public list of mysteries;
- loading one mystery and its current runtime state;
- validating and processing submitted answers;
- managing hints;
- enforcing mystery unlocking;
- enforcing question order;
- preventing secret answers and hint text from being exposed before they are needed;
- updating the in-memory game state.

The controller works with four important data sources/utilities:

- `server/src/data/mysteries.js` — static mystery definitions, questions, answers, hints, final reveals, and progression.
- `server/src/data/gameState.js` — runtime progress for the current server process.
- `server/src/utils/validation.js` — request/ID validation.
- `server/src/utils/answerChecker.js` — answer normalization and comparison.

## Controller Helpers

### `findMystery(mysteryId)`

Finds a mystery by its string ID.

Workflow:

1. Receives a mystery ID.
2. Searches the `mysteries` array.
3. Returns the matching mystery object.
4. Returns `undefined` when it does not exist.

It is used by the controller before accessing mystery-specific data.

---

### `findQuestion(mystery, questionId)`

Finds a question inside a mystery.

Workflow:

1. Receives the mystery object and question ID.
2. Converts the URL parameter from string to number.
3. Searches the mystery's questions.
4. Returns the matching question or `undefined`.

This conversion is required because route parameters arrive as strings while question IDs in the data are numbers.

---

### `getOrderedQuestions(mystery)`

Returns questions in their declared order.

Workflow:

1. Copies the original questions array.
2. Sorts the copy by `order`.
3. Returns the ordered array.
4. The original mystery data is not mutated.

This function is important because gameplay progression depends on question order.

---

### `toPublicQuestion(question)`

Creates the safe frontend representation of a question.

The response contains:

- `id`
- `order`
- `text`
- `maxHints`

It deliberately does **not** contain:

- `answer`
- `hints`

This prevents the frontend from receiving the solution or secret hints before the player requests them.

---

### `toPublicMystery(mystery, state)`

Builds the public mystery response.

The normal response contains:

- mystery metadata;
- ordered public questions;
- `currentQuestionId`;
- `completed`;
- `hintsUsed`.

When the mystery is completed, it additionally includes:

- `finalReveal`;
- `nextMysteryId`.

This creates an important security boundary:

> The frontend receives gameplay state, but does not receive answers or hidden hints.

---

### `isMysteryUnlocked(mysteryId)`

Determines whether a mystery can currently be played.

Workflow:

1. Finds the mystery index.
2. If the mystery does not exist, returns `false`.
3. The first mystery is always unlocked.
4. For every later mystery, finds the previous mystery.
5. Reads the previous mystery's runtime state.
6. Returns `true` only when the previous mystery is completed.

This rule is enforced by the backend, not only by the UI.

Example:

`mystery-2` becomes available only after `mystery-1` has `completed === true`.

---

### `toPublicMysteryListItem(mystery)`

Creates the safe object used by the mystery collection endpoint.

It returns:

- `id`
- `title`
- `description`
- `unlocked`

The actual answers, hints, and final reveal are never included.

---

### `ensureMysteryState(mysteryId)`

Creates runtime state the first time a mystery is accessed.

Initial state:

```js
{
  currentQuestionId: firstQuestionId,
  solvedQuestionIds: [],
  hintsUsed: {},
  completed: false
}
```

If state already exists, the existing state is returned.

Important:

- state is stored in memory;
- restarting the server resets progress;
- this is intentional for the current project and is not a database/session system.

## API Controller Functions

## 1. `getMysteries(req, res)`

### Route

`GET /api/mysteries`

### Purpose

Returns the list of available mysteries and their current unlocked status.

### Workflow

```text
Frontend
  ↓
GET /api/mysteries
  ↓
getMysteries()
  ↓
mysteries.map(toPublicMysteryListItem)
  ↓
JSON list
```

No gameplay secrets are returned.

Example shape:

```json
[
  {
    "id": "mystery-1",
    "title": "...",
    "description": "...",
    "unlocked": true
  }
]
```

---

## 2. `getMysteryById(req, res)`

### Route

`GET /api/mysteries/:id`

### Purpose

Loads one mystery together with the backend's current gameplay state.

### Workflow

```text
Request
  ↓
Validate Mystery ID
  ↓
Find mystery
  ↓
Does it exist?
  ├─ No → 404
  └─ Yes
       ↓
Is it unlocked?
  ├─ No → 403
  └─ Yes
       ↓
Ensure runtime state
       ↓
Convert to public mystery
       ↓
200 JSON response
```

### Error cases

- Missing ID → `400`
- Mystery does not exist → `404`
- Mystery is locked → `403`

### Important behavior

If the mystery has already been completed, the public response can include the final reveal and next mystery ID.

---

## 3. `submitAnswer(req, res)`

### Route

`POST /api/mysteries/:id/questions/:questionId/answer`

### Purpose

Validates a player's answer and advances gameplay when the answer is correct.

### Full workflow

```text
Frontend sends answer
  ↓
Validate request body
  ↓
Validate mystery ID
  ↓
Validate question ID
  ↓
Find mystery
  ↓
Check mystery unlock status
  ↓
Find question
  ↓
Get runtime state
  ↓
Is mystery already completed?
  ├─ Yes → 400
  └─ No
       ↓
Is this the current question?
  ├─ No → 400
  └─ Yes
       ↓
checkAnswer()
       ↓
Correct?
  ├─ No → 200 { correct: false }
  └─ Yes
       ↓
Mark question as solved
       ↓
Is there another question?
  ├─ Yes → move currentQuestionId forward
  │        → return nextQuestionId
  │
  └─ No → mark mystery completed
           → return finalReveal + nextMysteryId
```

### Wrong answer

The server returns:

```json
{
  "correct": false,
  "message": "Wrong answer. Try again."
}
```

The current question does not change.

### Correct non-final answer

The server:

1. records the question as solved;
2. finds the next ordered question;
3. updates `currentQuestionId`;
4. returns `nextQuestionId`.

### Correct final answer

The server:

1. marks the mystery completed;
2. sets `currentQuestionId` to `null`;
3. returns the final reveal;
4. returns the next mystery ID.

### Why question order is enforced

The controller compares the submitted question ID with:

`state.currentQuestionId`

Therefore, a player cannot skip directly to a later question.

---

## 4. `requestHint(req, res)`

### Route

`PATCH /api/mysteries/:id/questions/:questionId/hint`

### Purpose

Returns the next available hint for the current question.

### Workflow

```text
Request hint
  ↓
Validate mystery ID
  ↓
Validate question ID
  ↓
Find mystery
  ↓
Check unlocked
  ↓
Find question
  ↓
Get runtime state
  ↓
Is mystery completed?
  ├─ Yes → 400
  └─ No
       ↓
Is question current?
  ├─ No → 400
  └─ Yes
       ↓
Read hintsUsed for question
       ↓
Maximum reached?
  ├─ Yes → 400
  └─ No
       ↓
Select next hint
       ↓
Increment hintsUsed
       ↓
Return hint + hintsRemaining
```

The maximum is defined by:

`MAX_HINTS = 2`

The frontend never receives all hints at once.

## Complete Gameplay Workflow

```text
Home
  ↓
GET /api/mysteries
  ↓
Player selects unlocked mystery
  ↓
GET /api/mysteries/:id
  ↓
Backend creates/loads runtime state
  ↓
Current question is returned
  ↓
Player submits answer
  ↓
POST .../answer
  ↓
Backend validates and checks answer
  ↓
Wrong → stay on same question
Correct → advance
  ↓
Final question solved
  ↓
Mystery completed
  ↓
Final reveal returned
  ↓
Frontend navigates to Result
  ↓
Next mystery becomes unlocked
```

## Controller Responsibility Rule

The backend controller is the source of truth for:

- mystery existence;
- mystery unlocking;
- current question;
- question ordering;
- answer correctness;
- hint limits;
- completion state;
- final reveal availability.

The frontend should never reproduce these rules as the authoritative source.
