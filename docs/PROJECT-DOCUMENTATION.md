# Mystery Room — Complete Project Documentation

> **Audience:** project team, reviewers, and anyone who needs to understand the architecture without reading every file first.
>
> **Project:** `mini-project-01-mystery-room`
>
> **Purpose:** explain not only **what** the project contains, but **why** each architectural decision was made and how the frontend, backend, state, routing, validation, and user experience fit together.

## 1. Project Overview

Mystery Room is an interactive browser-based mystery / escape-room experience. The player opens a mystery, reads its story, inspects the available information, answers questions, and receives hints when necessary. The frontend communicates with an Express backend, and the backend is responsible for the authoritative gameplay state and answer validation.

The project specification requires a real React frontend connected to a real Express backend, React Router with a dynamic route, a real API with validation/status codes/error handling, and an experience-oriented UI rather than a CRUD/dashboard interface.

The intended user flow is:

```text
Home / Intro
    ↓
Choose / start a mystery
    ↓
Read the situation
    ↓
Inspect clues / room information
    ↓
Submit an answer
    ↓
Backend validates and processes the answer
    ↓
Correct → next question / Wrong → try again
    ↓
Complete the mystery
    ↓
Final result / reveal
```

The specification also makes an important architectural point: state ownership should be reasoned about rather than selecting a library simply because it was taught.

## 2. High-Level Architecture

```text
mini-project-01-mystery-room/
├── client/          # React + TypeScript frontend
├── server/          # Node.js + Express backend
├── README.md
└── docs/
    └── PROJECT-DOCUMENTATION.md
```

### Frontend responsibilities

- render the UI;
- navigate between screens;
- collect user input;
- display loading/error/success states;
- call the backend through a dedicated API layer;
- keep UI-only state locally;
- display global notifications through Context.

### Backend responsibilities

- define HTTP endpoints;
- validate incoming data;
- find mysteries/questions;
- enforce mystery unlocking rules;
- own current gameplay state;
- check answers;
- move the player to the next question;
- manage hint usage;
- return meaningful HTTP status codes.

## 3. Frontend Architecture

### 3.1 `client/src/App.tsx`

`App.tsx` is intentionally small. It imports global styles and renders `AppRouter`. Keeping the root component small prevents routing, API calls, and business logic from being mixed together.

### 3.2 Routing — `client/src/routes/AppRouter.tsx`

Current routes:

| Route | Purpose |
|---|---|
| `/` | Home |
| `/how-to-play` | Instructions |
| `/about` | About |
| `/settings` | Settings |
| `/result/:id` | Result/reveal |
| `/mystery/:id/explore` | Mystery introduction |
| `/mystery/:id` | Active gameplay |
| `*` | Not Found |

Dynamic routes let the same page render different mysteries based on the URL parameter. For example, `/mystery/room-01` and `/mystery/room-02` can both be handled by `MysteryPage`.

## 4. Pages and Components

The frontend separates route-level pages from reusable UI components.

```text
pages/
├── Home.tsx
├── HowToPlay.tsx
├── About.tsx
├── Settings.tsx
├── NotFound.tsx
├── Result/
└── Mystery/
    ├── MysteryIntroPage.tsx
    └── MysteryPage.tsx

components/
├── hint/HintCard.tsx
├── layout/AppHeader.tsx
├── mystery/RoomHero.tsx
├── mystery/RoomSidebar.tsx
├── question/QuestionCard.tsx
└── result/SuccessScreen.tsx
```

### `MysteryPage`

`MysteryPage.tsx` is the main gameplay orchestrator. It coordinates loading, answer submission, hints, navigation, notifications, and error handling.

## 5. Why `useState` Is Used

Gameplay UI state is local to the gameplay screen. Examples include:

- `isLoading`;
- `loadError`;
- `actionError`;
- `feedback`;
- `hint`;
- `hintsRemaining`;
- `isSubmitting`;
- `isRequestingHint`;
- current `questionId`.

These values do not need to be globally available. Therefore local `useState` is the simplest ownership model.

The specification's state-ownership guidance says that state only one screen needs should be fetched there and kept local.

## 6. Why `useEffect` Is Used

The mystery is loaded as a side effect of the route/component state:

```text
URL /mystery/:id
      ↓
useParams()
      ↓
id
      ↓
useEffect()
      ↓
loadMystery()
      ↓
API
      ↓
setState()
```

`useEffect` is appropriate because fetching data is a side effect and should not happen during React render.

## 7. Why `useCallback` Is Used

`MysteryPage` defines `loadMystery` with `useCallback` and then uses it as a dependency of `useEffect`:

```text
const loadMystery = useCallback(async () => {
  ...
}, [id, navigate]);

useEffect(() => {
  loadMystery();
}, [loadMystery]);
```

Functions declared inside a component are recreated on every render. If the function were directly used as an effect dependency, its identity could change on every render. `useCallback` keeps the callback identity stable until its real dependencies change.

The important dependency here is the route `id`. Therefore:

```text
same id → same callback identity
new id  → new callback → effect loads new mystery
```

The important reason is not “performance optimization everywhere”; it is that the callback participates in the `useEffect` dependency model.

## 8. Why We Did Not Use Redux for Main Gameplay State

The specification explicitly allows Context, Redux Toolkit, or neither, and asks the team to reason about ownership.

Our ownership map is:

| State | Owner | Reason |
|---|---|---|
| Current mystery ID | React Router / URL | It is navigation state |
| Input text | Local component state | Only the input needs it |
| Screen-specific data | Local page state | Only gameplay needs it |
| Notifications | Context | Shared UI behavior |
| Actual mystery progress | Backend | Server is authoritative |

Redux would add a global store, slices/actions/reducers/selectors and additional synchronization for state that is mostly local or server-owned.

So not using Redux is an intentional architecture decision, not a missing feature.

### When Redux could become reasonable

If the product later introduced genuinely complex client-owned state shared by many distant parts of the application—such as a large inventory or complex cross-screen player state—Redux could become justified. That is not the current problem.

## 9. Why Context Is Used

We do use Context, but for a focused responsibility: notifications.

`NotificationContext.tsx` exposes:

```text
showNotification(type, message)
hideNotification()
```

The notification state is internal to the provider, while any descendant can trigger a notification without prop-drilling through unrelated components.

Therefore the current model is:

```text
Local UI state       → useState
Shared UI behavior   → Context
Complex global state → Redux only if genuinely needed
Gameplay truth       → backend
```

## 10. API Service Layer — `client/src/services/api.ts`

All backend calls are centralized in `services/api.ts` rather than scattered across components.

Named functions include:

```text
getMysteries()
getMysteryById(id)
submitAnswer(mysteryId, questionId, answer)
requestHint(mysteryId, questionId)
```

The shared `request<T>()` helper handles:

1. building the API URL;
2. `fetch`;
3. network errors;
4. JSON parsing;
5. HTTP status checking;
6. conversion to `ApiError`;
7. typed return data.

This keeps components focused on UI and application behavior instead of HTTP details.

## 11. TypeScript Data Contracts

`client/src/types/mystery.types.ts` defines:

```text
MysteryListItem
Question
Mystery
AnswerResponse
HintResponse
ApiErrorResponse
```

`AnswerResponse` models three outcomes:

```text
Wrong answer
Correct, mystery continues
Correct, mystery completed
```

This makes the API contract explicit and easier for frontend/backend team members to share.

## 12. MysteryPage Execution Flow

Initial load:

```text
/mystery/:id
    ↓
useParams()
    ↓
loadMystery()
    ↓
Promise.all()
 ├── getMysteryById(id)
 └── getMysteries()
    ↓
find current question
    ↓
set local state
    ↓
render gameplay
```

The current implementation uses `Promise.all` because the two initial requests are independent and can run concurrently.

If the backend says the mystery is already completed, the page redirects to `/result/:id`.

## 13. Answer Submission Flow

```text
QuestionCard
    ↓
MysteryPage.submitAnswer()
    ↓
services/api.ts
    ↓
POST /api/mysteries/:id/questions/:questionId/answer
    ↓
Backend controller
    ↓
validate + check state + check answer
    ↓
JSON response
    ↓
MysteryPage
```

### Wrong answer

The server returns `correct: false`; the player stays on the same question.

### Correct answer with more questions

The backend advances its runtime state. The frontend refreshes the mystery state and displays the next question.

### Correct final answer

The backend marks the mystery completed and returns the final reveal. The frontend navigates to `/result/:id`.

The frontend never becomes the authority for correctness or completion.

## 14. Hint Flow

```text
HintCard
    ↓
requestCurrentHint()
    ↓
PATCH /api/mysteries/:id/questions/:questionId/hint
    ↓
requestHint controller
    ↓
validate + check state + check hint count
    ↓
update gameState
    ↓
return hint + remaining count
    ↓
frontend updates HintCard
```

The backend currently enforces `MAX_HINTS = 2`.

## 15. Backend Architecture

The backend is organized as:

```text
server/src/
├── server.js
├── routes/
│   └── mystery.routes.js
├── controllers/
│   └── mystery.controller.js
├── data/
│   ├── mysteries.js
│   └── gameState.js
└── utils/
    ├── validation.js
    └── answerChecker.js
```

This is intentionally simpler than a production service/repository architecture because those layers are outside the assignment's scope.

## 16. `server.js`

`server.js` bootstraps Express. It:

1. creates the Express app;
2. enables CORS;
3. enables JSON parsing;
4. mounts `/api/mysteries`;
5. provides an API 404 fallback;
6. provides a final error handler;
7. starts the server.

The entry point is therefore infrastructure/bootstrap code, not a place for gameplay business logic.

## 17. Routes — `mystery.routes.js`

Current routes:

| Method | Endpoint | Controller | Purpose |
|---|---|---|---|
| GET | `/api/mysteries` | `getMysteries` | List mysteries |
| GET | `/api/mysteries/:id` | `getMysteryById` | One mystery |
| POST | `/api/mysteries/:id/questions/:questionId/answer` | `submitAnswer` | Submit answer |
| PATCH | `/api/mysteries/:id/questions/:questionId/hint` | `requestHint` | Request hint |

The distinction is:

```text
Router     = mapping
Controller = behavior
```

The router decides which function handles a URL/method. The controller decides what happens.

## 18. Controllers — Detailed Explanation

`mystery.controller.js` exports:

```text
getMysteries()
getMysteryById()
submitAnswer()
requestHint()
```

It also contains small private helpers that keep repeated business logic out of the endpoint functions.

### `findMystery(id)`

Finds a mystery in the static data collection.

### `findQuestion(mystery, questionId)`

Converts the URL question ID from string to number and finds the matching question.

### `getOrderedQuestions(mystery)`

Creates a copy and sorts questions by their `order` field.

### `toPublicQuestion(question)`

Creates a safe public question shape containing the ID/order/text/max hints but not the answer or private hint contents.

### `toPublicMystery(mystery, state)`

Combines static mystery data and runtime state into the response returned to the client. Final reveal fields are only exposed after completion.

### `isMysteryUnlocked(id)`

Enforces sequential progression. The first mystery is unlocked; later mysteries become available when the previous mystery is completed.

### `toPublicMysteryListItem(mystery)`

Creates the lightweight shape used by the collection endpoint.

### `ensureMysteryState(id)`

Lazily creates runtime state the first time a mystery is accessed:

```text
currentQuestionId
solvedQuestionIds
hintsUsed
completed
```

## 19. `GET /api/mysteries`

Returns a lightweight collection of mysteries using `toPublicMysteryListItem()`.

It is intended for the mystery-selection/room UI and does not expose internal gameplay data.

## 20. `GET /api/mysteries/:id`

The controller flow is:

```text
1. Validate ID
2. Find mystery
3. Check unlock state
4. Ensure runtime state
5. Build public response
6. Return 200
```

Possible outcomes:

```text
400 → invalid/missing ID
404 → mystery does not exist
403 → mystery is locked
200 → valid mystery
```

## 21. `POST .../answer` — Controller Flow

The answer controller deliberately performs checks in this order:

```text
1. Validate body
2. Validate IDs
3. Find mystery
4. Check unlock state
5. Find question
6. Get runtime state
7. Check completed state
8. Check current question
9. Check answer
10. Update state
11. Move to next question or complete mystery
12. Return response
```

This order makes the endpoint predictable and protects the game rules from client manipulation.

## 22. Why a Wrong Answer Returns 200

A `400 Bad Request` means the request itself is invalid.

For example, missing `answer` is invalid input:

```json
{}
```

But a valid request with a wrong guess is a legitimate gameplay action:

```json
{"answer":"wrong guess"}
```

Therefore:

```text
Malformed/missing answer → 400
Valid but incorrect guess → 200 + correct:false
```

This distinction gives the API meaningful HTTP semantics.

## 23. `PATCH .../hint`

The hint endpoint changes state because using a hint consumes one available hint.

Its flow is:

```text
validate IDs
→ find mystery
→ check unlock
→ find question
→ get state
→ check completion
→ check current question
→ check hint count
→ return hint
→ increment hintsUsed
```

The current maximum is two hints per question.

## 24. Validation — `validation.js`

Validation intentionally uses plain JavaScript checks, as required by the assignment.

For answers it checks:

```text
typeof answer === "string"
AND answer.trim() !== ""
```

For IDs it checks that a value is not missing/empty.

Validation is separated from controllers so the controller can read like a sequence of business decisions instead of a collection of low-level type checks.

## 25. Answer Checker — `answerChecker.js`

Answer checking is a tiny utility with one responsibility.

It normalizes both values using:

```text
trim()
↓
toLowerCase()
```

and then compares them.

So capitalization and surrounding spaces do not cause an otherwise correct answer to fail.

## 26. Runtime State — `gameState.js`

The project does not use a database. Runtime gameplay state is kept in one shared in-memory object:

```text
const gameState = {
  mysteries: {},
};
```

Static mystery content and runtime state are intentionally separated:

```text
Static content
= title, story, questions, answers, hints

Runtime state
= current question, solved questions, used hints, completed
```

This gives the backend a clear owner of the current game state without adding database infrastructure that the assignment explicitly excludes.

## 27. Why the Backend Owns the Real Game State

The frontend should never be the authority for:

- current question;
- whether an answer is correct;
- whether a mystery is completed;
- how many hints remain;
- whether the next mystery is unlocked.

The flow is:

```text
Frontend asks
    ↓
Backend checks authoritative state
    ↓
Backend updates state
    ↓
Backend responds
    ↓
Frontend renders
```

This is also why Redux would not solve the main gameplay-state problem: Redux is still client-side state, while the server must remain authoritative for the game rules.

## 28. Public Data vs Internal Data

The backend deliberately transforms internal objects before returning them.

For example, a question's correct answer is not returned to the browser before the player submits it. This prevents the mystery from being trivially solved by inspecting the API response.

The controller therefore acts as the boundary between internal game data and public API data.

## 29. Error Handling

There are three layers:

### Backend

Returns explicit statuses and JSON messages:

```text
400 → invalid request
403 → locked mystery
404 → missing resource
500 → unexpected server error
```

### API service

`ApiError` converts HTTP/network failures into a consistent frontend error type.

### Page

`MysteryPage` distinguishes:

- initial load errors;
- action errors;
- wrong-answer feedback;
- loading state.

This prevents the page from becoming a blank screen when the backend fails.

## 30. Why `fetch()` Is Not Scattered Across Components

Bad:

```text
QuestionCard
  ↓
fetch(...)
```

Current architecture:

```text
QuestionCard
  ↓ callback
MysteryPage
  ↓
services/api.ts
  ↓
Backend
```

This centralizes base URLs, JSON handling, status handling, and network errors.

## 31. Why `Promise.all()` Is Used

The initial page needs both:

```text
getMysteryById(id)
getMysteries()
```

Neither depends on the result of the other, so they can run concurrently. This avoids making the second request wait unnecessarily for the first.

## 32. Why We Refresh After a Correct Answer

After an answer, the backend changes authoritative state. Rather than trying to manually reproduce every backend state change in React, the frontend fetches the updated mystery.

```text
POST answer
    ↓
Backend changes state
    ↓
GET mystery
    ↓
Frontend renders authoritative state
```

This reduces the chance of frontend/backend state drifting apart.

## 33. Why `useNavigate` Is Used

`useNavigate` is appropriate when navigation is caused by application logic rather than a simple link.

Examples:

```text
mystery already completed → /result/:id
final answer correct      → /result/:id
```

## 34. Why `useParams` Is Used

`useParams` reads the dynamic mystery ID from the URL:

```text
/mystery/room-01
       ↓
id = "room-01"
       ↓
getMysteryById(id)
```

This keeps the page generic and data-driven.

## 35. Why Loading and Action Errors Are Separate

`loadError` means the page could not load the mystery itself.

`actionError` means the mystery is loaded but a later action failed, such as requesting a hint.

Keeping them separate allows the app to preserve the playable screen when possible instead of replacing everything with a generic error.

## 36. Why `isSubmitting` and `isRequestingHint` Exist

Async actions can be clicked repeatedly before the first request completes.

These flags prevent duplicate submissions and duplicate hint requests.

They are purely UI interaction state, so local `useState` is appropriate.

## 37. Backend vs Frontend Responsibility

### Frontend decides presentation

- what to display;
- loading UI;
- error UI;
- feedback appearance;
- navigation based on server results.

### Backend decides gameplay

- whether a mystery exists;
- whether it is unlocked;
- whether a question is current;
- whether an answer is correct;
- whether a hint remains;
- whether the mystery is completed;
- what the final reveal is.

This boundary is the core of the architecture.

## 38. Why There Is No Database

The assignment explicitly excludes MongoDB, PostgreSQL, Prisma, Mongoose, and other database/ORM solutions and asks for in-memory runtime state.

For this educational scope:

```text
Static JS data + runtime JS state
             ↓
        Express controllers
```

is enough.

## 39. Why There Is No Backend Service/Repository Layer

The assignment explicitly excludes complex service/repository layers and dependency injection.

Therefore:

```text
Route
  ↓
Controller
  ↓
Data + utilities
```

is intentional scope control. A larger production system could extract services later, but doing so now would add complexity without solving a project requirement.

## 40. Why There Is No React Query / RTK Query

The assignment explicitly excludes React Query and RTK Query. The request lifecycle is therefore intentionally visible through:

```text
useEffect
useState
API helper functions
```

This makes the data-fetching process easier for the team to understand and explain.

## 41. Why There Is No Authentication

Authentication, login/register, JWT, sessions, cookie auth, and password hashing are out of scope. Mystery Room is a gameplay experience rather than a user-account system.

Adding authentication would introduce users, credentials, tokens/sessions, authorization and storage without contributing to the required learning objectives.

## 42. Styling and Assets

CSS files are colocated with components/pages, for example:

```text
QuestionCard.tsx
QuestionCard.css

RoomHero.tsx
RoomHero.css
```

The frontend also includes generated room imagery under `client/src/assets/generated/`, supporting the intended experience-oriented visual identity.

## 43. API Contract Summary

```text
GET    /api/mysteries
GET    /api/mysteries/:id
POST   /api/mysteries/:id/questions/:questionId/answer
PATCH  /api/mysteries/:id/questions/:questionId/hint
```

### Answer request

```json
{
  "answer": "player answer"
}
```

### Wrong answer

```json
{
  "correct": false,
  "message": "Wrong answer. Try again."
}
```

### Correct, mystery continues

```json
{
  "correct": true,
  "message": "Correct answer.",
  "mysteryCompleted": false,
  "nextQuestionId": 2
}
```

### Correct, mystery completed

```json
{
  "correct": true,
  "message": "Correct answer. Mystery completed.",
  "mysteryCompleted": true,
  "finalReveal": "...",
  "nextMysteryId": null
}
```

### Hint response

```json
{
  "hint": "...",
  "hintsRemaining": 1
}
```

## 44. Complete Answer Lifecycle

```text
PLAYER
  │ types answer
  ▼
QuestionCard
  │ onSubmit(answer)
  ▼
MysteryPage.submitAnswer()
  │
  ▼
client/src/services/api.ts
  │
  ▼
Express Router
  │
  ▼
mystery.controller.js
  │
  ├── validate
  ├── find mystery/question
  ├── check unlock/current state
  ├── check answer
  ├── update gameState
  └── create response
  │
  ▼
JSON
  │
  ▼
MysteryPage
  │
  ├── feedback
  ├── refresh state
  └── navigate if completed
  │
  ▼
React UI
```

## 45. Complete Hint Lifecycle

```text
Player clicks Hint
       ↓
HintCard
       ↓
MysteryPage.requestCurrentHint()
       ↓
api.ts PATCH request
       ↓
Express Router
       ↓
requestHint controller
       ↓
validate + state checks + hint count
       ↓
update gameState
       ↓
return hint
       ↓
React state
       ↓
HintCard
```

## 46. Git and Team Collaboration

The project specification expects every team member to make visible contributions, understand the whole project, and participate in the English presentation. It also recommends regular commits and a branch/workflow agreed by the team.

The team should agree on the API shape and data model early, before splitting work, so frontend and backend do not disagree about response structures.

A useful division is:

```text
Frontend UI
Frontend API integration
Backend routes/controllers
Backend data/validation
Testing
Git coordination
Presentation
```

## 47. Testing Strategy

Every backend endpoint should be independently testable with curl, Postman, or Thunder Client.

Recommended matrix:

| Endpoint | Happy path | Invalid input | Missing resource | State rule |
|---|---|---|---|---|
| GET collection | 200 | — | — | unlocked flags |
| GET by ID | 200 | 400 | 404 | 403 locked |
| POST answer | 200 | 400 | 404 | completed/current question |
| PATCH hint | 200 | 400 | 404 | max hints/current question |

Test both happy and failure paths.

## 48. Common Mistakes to Avoid

### 1. Put gameplay rules only in the frontend

Do not make React the authority for correctness or completion.

### 2. Add Redux just because it was taught

Use it only when shared client state is genuinely complex.

### 3. Scatter `fetch()` across components

Use `services/api.ts`.

### 4. Return secret answers to the browser

The client should receive question text, not the correct answer.

### 5. Return 200 for missing resources

A missing mystery/question should be `404`.

### 6. Treat a wrong answer as malformed input

A wrong guess is valid gameplay, not a malformed request.

### 7. Duplicate runtime state

Keep the authoritative runtime state in backend `gameState`.

### 8. Overengineer the backend

Avoid database/ORM, GraphQL, WebSockets, Redis, authentication, complex repository/service layers, and other explicitly out-of-scope technologies.

## 49. Architecture Decision Record

### Decision

Use:

```text
React + TypeScript
React Router
useState / useEffect / useCallback
Context for notifications
Dedicated API service
Express Router + Controllers
In-memory runtime state
Simple validation utilities
```

### Reasons

1. Matches the concepts taught in the project.
2. Satisfies the project specification.
3. Makes state ownership explicit.
4. Avoids unnecessary global state.
5. Keeps gameplay rules on the backend.
6. Creates a clean API boundary.
7. Keeps the backend understandable.
8. Avoids prohibited or unnecessary infrastructure.

## 50. Presentation-Friendly Explanation

If asked to explain the architecture:

> “The frontend is a React and TypeScript application using React Router. Routes determine which page is displayed, and dynamic mystery IDs come from the URL. Screen-specific UI state is handled with `useState`, and `useEffect` loads the mystery when the route changes. We use `useCallback` for the loader because it is a dependency of `useEffect`, so its identity remains stable until the mystery ID changes. We use Context only for global notifications instead of Redux because our gameplay state is either local to the screen or authoritative on the backend. API calls are centralized in `services/api.ts`. On the backend, Express routes map requests to controller functions. Controllers validate requests, enforce mystery rules, update the shared in-memory game state, and return meaningful status codes. The backend is the source of truth for progression, answers, hints, and completion.”

## 51. One-Page Mental Model

```text
                         MYSTERY ROOM
                              │
              ┌───────────────┴───────────────┐
              │                               │
          FRONTEND                         BACKEND
          React/TS                        Express
              │                               │
        React Router                    Routes
              │                               │
            Pages                       Controllers
              │                               │
        Components                 Validation / Utilities
              │                               │
       Local useState                  Static Data
       useEffect                       Runtime gameState
       useCallback                           │
              │                             │
              └──────── services/api.ts ────┘
                              │
                           HTTP/JSON
```

State ownership:

```text
URL                 → Router
Component UI        → useState
Shared notification → Context
Complex global UI   → Redux only if genuinely needed
Game truth          → Backend
Static mystery      → Backend data
```

## 52. Developer Checklist

Before modifying the project, ask:

- Does this state belong to the URL, a component, Context, or the backend?
- Does this API call belong in `services/api.ts`?
- Is this business rule enforced by the backend?
- Does a new endpoint belong in `routes/` and `controllers/`?
- Does this validation belong in `utils/validation.js`?
- Can repeated logic be a small helper?
- Does the frontend handle loading and errors?
- Does the backend return the correct status code?
- Am I adding a library the project does not actually need?
- Am I making the architecture more complex than the assignment requires?

## 53. Final Conclusion

Mystery Room is intentionally built around **clear ownership and simple boundaries** rather than a large number of libraries.

The central architecture is:

```text
React UI
   ↓
Pages / Components
   ↓
API service
   ↓
Express Router
   ↓
Controllers
   ↓
Validation + Utilities
   ↓
Static data + Runtime game state
```

The most important lessons are architectural reasoning skills:

1. Put state where it actually belongs.
2. Keep the backend authoritative for gameplay rules.
3. Keep API communication centralized.
4. Keep components focused on UI.
5. Use Context/Redux only when sharing is genuinely needed.
6. Use hooks because of a concrete lifecycle/state reason.
7. Prefer simple architecture when the problem is simple.
8. Make errors and HTTP semantics explicit.

That is why this project does not need Redux for the main gameplay state, why `useCallback` is useful in `MysteryPage`, why the controller contains the gameplay rules, and why `gameState` is separated from static mystery data.
