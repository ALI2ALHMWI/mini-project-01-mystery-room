# Types Reference

## Purpose

The frontend TypeScript types define the data contract between the React application and the backend API.

Main file:

`client/src/types/mystery.types.ts`

The types describe:

- mystery list items;
- questions;
- complete mystery responses;
- answer responses;
- hint responses;
- API errors.

They do not contain the secret answer or raw hint data because those fields are intentionally not part of the public question response.

## 1. `MysteryListItem`

```ts
export interface MysteryListItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}
```

### Purpose

Represents a mystery in the collection/list view.

### Fields

- `id` — unique mystery identifier.
- `title` — mystery title.
- `description` — short public description.
- `unlocked` — whether the backend currently allows the player to enter it.

### Used by

- Home page;
- RoomSidebar;
- `getMysteries()`.

---

## 2. `Question`

```ts
export interface Question {
  id: number;
  order: number;
  text: string;
  maxHints: number;
}
```

### Purpose

Represents the public version of a gameplay question.

### Fields

- `id` — numeric question ID.
- `order` — question sequence number.
- `text` — question shown to the player.
- `maxHints` — maximum number of hints available.

### Security boundary

There is intentionally no:

```ts
answer
hints
```

property.

The backend keeps those values private until they are needed.

---

## 3. `Mystery`

```ts
export interface Mystery extends MysteryListItem {
  story: string;
  questions: Question[];
  currentQuestionId: number | null;
  completed: boolean;
  hintsUsed: Record<string, number>;
  finalReveal?: string;
  nextMysteryId?: string | null;
}
```

### Purpose

Represents a complete public mystery response plus runtime gameplay state.

Because it extends `MysteryListItem`, it also contains:

- `id`;
- `title`;
- `description`;
- `unlocked`.

### Fields

#### `story`

The public story displayed before/during the investigation.

#### `questions`

The public question list.

#### `currentQuestionId`

The question the backend says is currently playable.

This is important because the frontend must not guess the current question.

#### `completed`

Indicates whether the mystery has been completed.

#### `hintsUsed`

Tracks how many hints have already been requested for each question.

Example:

```ts
{
  "1": 2,
  "2": 1
}
```

#### `finalReveal?`

Optional because it is only returned when the mystery is completed.

#### `nextMysteryId?`

Optional because it becomes meaningful after completion.

## 4. `AnswerResponse`

This is a discriminated union with three gameplay outcomes.

### Wrong answer

```ts
{
  correct: false;
  message: string;
}
```

### Correct answer, mystery not completed

```ts
{
  correct: true;
  message: string;
  mysteryCompleted: false;
  nextQuestionId: number;
}
```

### Correct answer, mystery completed

```ts
{
  correct: true;
  message: string;
  mysteryCompleted: true;
  finalReveal: string;
  nextMysteryId: string | null;
}
```

### Why a union is useful

TypeScript can understand the response based on `correct` and `mysteryCompleted`.

Example:

```ts
if (!result.correct) {
  // wrong-answer branch
}

if (result.mysteryCompleted) {
  // final-completion branch
}
```

This prevents the frontend from assuming that every successful response has the same structure.

---

## 5. `HintResponse`

```ts
export interface HintResponse {
  hint: string;
  hintsRemaining: number;
}
```

### Purpose

Represents the result of one successful hint request.

### Fields

- `hint` — the single hint returned by the backend.
- `hintsRemaining` — number of hints still available.

The frontend should not construct or reveal hints itself.

---

## 6. `ApiErrorResponse`

```ts
export interface ApiErrorResponse {
  message: string;
}
```

### Purpose

Describes the standard JSON error response from the backend.

Example:

```json
{
  "message": "Mystery is locked."
}
```

This type is used by `api.ts` when interpreting API errors.

---

# Type Contract Workflow

```text
Backend data
  ↓
Controller creates public response
  ↓
HTTP JSON
  ↓
services/api.ts
  ↓
TypeScript generic type
  ↓
Mystery / Question / Response type
  ↓
React page state
  ↓
Components
```

## Backend → Frontend Contract

| Backend concept | Frontend type |
|---|---|
| Public mystery list item | `MysteryListItem` |
| Public question | `Question` |
| Public mystery response | `Mystery` |
| Wrong/correct answer response | `AnswerResponse` |
| Hint response | `HintResponse` |
| API error JSON | `ApiErrorResponse` |

## Important Security Rule

TypeScript types are not a security mechanism.

Even if a frontend type does not contain `answer`, the backend must still avoid sending `answer` in the JSON response.

The actual security boundary is the backend controller's public response transformation.

## State Ownership

The backend owns:

- current question;
- completed status;
- hints used;
- unlocked status;
- answer correctness.

The frontend types describe that state so React can consume it safely and predictably.

The frontend should not invent a different source of truth.
