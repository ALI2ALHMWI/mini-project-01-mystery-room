# Mini Project 01 — Mystery Room

## Project Structure

## 1. Project Overview

This project is a browser-based interactive mystery experience.

The user enters a mystery, reads the story, investigates clues, answers questions, receives hints when needed, and progresses through the mystery step by step.

The frontend is responsible for the user interface and interaction.

The backend is responsible for the mystery data, answer validation, hints, progression rules, and runtime game state.

The backend is the source of truth for the actual mystery progression.

---

# 2. Root Structure

```text
Mini-Project-01/
│
├── client/
│   ├── src/
│   └── package.json
│
├── server/
│   ├── src/
│   └── package.json
│
├── docs/
│   ├── PROJECT-STRUCTURE.md
│   ├── API.md
│   └── TASKS.md
│
├── README.md
└── .gitignore
```

---

# 3. Frontend Structure

```text
client/
└── src/
    ├── assets/
    │
    ├── components/
    │   ├── common/
    │   ├── mystery/
    │   ├── question/
    │   └── hint/
    │
    ├── pages/
    │   ├── Home/
    │   ├── HowToPlay/
    │   ├── Mystery/
    │   └── Result/
    │
    ├── routes/
    │   └── AppRouter.tsx
    │
    ├── context/
    │   └── NotificationContext.tsx
    │
    ├── hooks/
    │
    ├── services/
    │   └── api.ts
    │
    ├── types/
    │   └── mystery.types.ts
    │
    ├── styles/
    │
    ├── App.tsx
    └── main.tsx
```

---

# 4. Frontend Responsibilities

## `assets/`

Contains frontend assets such as:

* images
* icons
* visual resources

Assets should be added only when they are actually required by the interface.

---

## `components/`

Contains reusable UI components.

### `components/common/`

Shared UI components used in multiple parts of the application.

Examples:

* Button
* Loading
* ErrorMessage
* Card
* Navigation

---

### `components/mystery/`

Components related to displaying mystery information.

Examples:

* MysteryHeader
* StorySection
* ProgressIndicator

---

### `components/question/`

Components responsible for question interaction.

Examples:

* QuestionCard
* AnswerInput
* AnswerFeedback

These components are responsible for the user interaction, not for implementing the backend game logic.

---

### `components/hint/`

Components related to hints.

Examples:

* HintButton
* HintDisplay
* HintCounter

The actual hint content comes from the backend.

---

# 5. Pages

## `pages/Home/`

The starting page of the application.

Responsibilities:

* introduce the game
* explain the basic goal
* provide a way to start
* navigate to an available mystery

---

## `pages/HowToPlay/`

Explains the game rules.

The page should explain:

* questions must be solved in order
* each question has one answer
* answers are case-insensitive
* each question allows a maximum of two hints
* wrong answers allow the user to retry
* correct answers allow progression

---

## `pages/Mystery/`

Contains the main gameplay screen.

Responsibilities:

* read the mystery ID from the URL
* request mystery data from the backend
* display loading state
* display errors
* display the story
* display the current question
* connect question interactions to the API
* progress through questions
* detect mystery completion
* navigate to the result screen

Expected route:

```text
/mystery/:id
```

The URL owns the current mystery ID.

---

## `pages/Result/`

Displays the completion state of a mystery.

Responsibilities:

* display the final reveal received from the backend
* indicate that the mystery is complete
* provide access to the next mystery when available
* display final completion when there are no more mysteries

The final reveal must not be hardcoded in the frontend.

---

# 6. Routing

## `routes/AppRouter.tsx`

Responsible for configuring React Router.

Required routes include:

```text
/
```

Home

```text
/how-to-play
```

How To Play

```text
/mystery/:id
```

Mystery gameplay

```text
/result/:id
```

Result

The project requires at least three meaningful routes and at least one dynamic route.

---

# 7. Context

## `context/NotificationContext.tsx`

The project does not use Redux.

Context is used only where genuinely shared state is required.

Currently, the main shared context is notifications.

The Notification Context is responsible for:

* displaying notifications
* allowing gameplay components to trigger notifications
* showing a notification after a correct answer

Example:

```text
Correct answer!
```

Gameplay state such as the current answer, input value, loading state, and current UI state should remain local to the relevant components.

---

# 8. State Management

The project uses a simple state-management approach.

### Local UI state

Use React `useState` for state that belongs to a specific component or screen.

Examples:

* answer input
* loading state
* error state
* current UI feedback
* hint display state

### `useEffect`

Use `useEffect` for side effects such as:

* loading mystery data
* reacting to URL changes
* synchronizing UI with API results when required

### Context

Use Context only for genuinely shared application concerns.

Currently:

```text
NotificationContext
```

### Redux

Redux is **not used** in this project.

There is no:

```text
store/
store.ts
slices/
```

The project intentionally keeps state management simple.

### Backend state

The backend owns the actual mystery progression.

The frontend must not become the source of truth for:

* correct answers
* solved questions
* hint usage
* mystery completion
* final reveal

---

# 9. API Service

## `services/api.ts`

All frontend API requests go through this file.

The UI should not call `fetch` directly.

The API service provides functions such as:

```text
getMysteries()
getMysteryById(id)
submitAnswer(mysteryId, questionId, answer)
requestHint(mysteryId, questionId)
```

The API service is responsible for:

* building request URLs
* making HTTP requests
* parsing responses
* handling HTTP errors
* returning data to the UI

The project intentionally uses a simple API helper instead of a larger data-fetching library.

---

# 10. TypeScript Types

## `types/mystery.types.ts`

Contains shared frontend TypeScript types.

Expected types include:

```text
Mystery
Question
MysteryListItem
AnswerResponse
HintResponse
ApiError
```

The types should reflect the actual backend API contract.

---

# 11. Backend Structure

```text
server/
└── src/
    ├── controllers/
    │   └── mystery.controller.js
    │
    ├── routes/
    │   └── mystery.routes.js
    │
    ├── data/
    │   ├── mysteries.js
    │   └── gameState.js
    │
    ├── utils/
    │   ├── validation.js
    │   └── answerChecker.js
    │
    ├── app.js
    └── server.js
```

---

# 12. Backend Responsibilities

## `controllers/mystery.controller.js`

Contains the main mystery/game logic.

Responsibilities:

* retrieve mysteries
* retrieve a specific mystery
* validate gameplay actions
* check the current question
* process answers
* advance progression
* process hints
* track hint usage
* complete mysteries
* return final reveal after completion
* determine the next mystery

The controller owns game progression logic.

---

## `routes/mystery.routes.js`

Contains Express routes.

Required endpoints:

```text
GET /api/mysteries
GET /api/mysteries/:id
POST /api/mysteries/:id/questions/:questionId/answer
PATCH /api/mysteries/:id/questions/:questionId/hint
```

The router connects endpoints to controller functions.

Game logic should not be implemented inside the router.

---

# 13. Backend Data

## `data/mysteries.js`

Contains static mystery data.

A mystery contains information such as:

```text
id
title
description
story
questions
finalReveal
nextMysteryId
```

A question contains:

```text
id
order
text
answer
hints
```

Correct answers and actual hint text exist only on the backend.

---

## `data/gameState.js`

Contains runtime in-memory state.

Runtime state is separate from static mystery data.

It may contain:

```text
currentQuestionId
solvedQuestionIds
hintsUsed
completed
```

The backend runtime state is the source of truth for the current game progression.

No database is used.

---

# 14. Backend Utilities

## `utils/validation.js`

Contains simple input validation.

Examples:

* required fields
* string validation
* empty input validation
* basic request validation

Invalid input should allow the controller to return HTTP `400`.

---

## `utils/answerChecker.js`

Contains answer comparison logic.

Answers are:

* trimmed
* normalized
* compared case-insensitively

Example:

```text
shadow
Shadow
SHADOW
```

are treated as the same answer.

---

# 15. Application Entry

## `app.js`

Responsible for:

* creating the Express application
* applying required middleware
* mounting the mystery router

Example route base:

```text
/api/mysteries
```

---

## `server.js`

Responsible for starting the Express server.

---

# 16. Game Flow

The complete application flow is:

```text
Home
  ↓
Choose / Start Mystery
  ↓
Mystery Page
  ↓
Load Mystery from Backend
  ↓
Read Story / Clues
  ↓
Question
  ↓
Submit Answer
  ↓
Correct?
 ┌───────────────┴───────────────┐
 │                               │
No                              Yes
 │                               │
Retry                       Next Question
 │                               │
 └─────── Same Question          ↓
                             More Questions?
                              │        │
                             Yes       No
                              │        │
                              ↓        ↓
                         Next Question Result
                                        ↓
                                   Final Reveal
                                        ↓
                               Next Mystery?
                                  │       │
                                 Yes      No
                                  │       │
                                  ↓       ↓
                             Next Mystery Final Completion
```

---

# 17. API Information Exposure

The frontend must not receive hidden solution information before it is needed.

## GET mystery

May return:

```text
id
title
description
story
questions
question id
question order
question text
maxHints
```

It must NOT return:

```text
correct answer
actual hint text
final reveal
```

The actual hint is returned only after requesting it through the hint endpoint.

The final reveal is returned only after the final answer is correctly submitted.

---

# 18. State Ownership Summary

| State              | Owner                 |
| ------------------ | --------------------- |
| Answer input       | React local state     |
| UI loading         | React local state     |
| UI errors          | React local state     |
| Hint display       | React local state     |
| Notifications      | Notification Context  |
| Current mystery ID | URL                   |
| Mystery data       | Backend               |
| Correct answers    | Backend               |
| Solved questions   | Backend runtime state |
| Hint usage         | Backend runtime state |
| Mystery completion | Backend runtime state |
| Final reveal       | Backend               |

---

# 19. Architectural Flow

The intended architecture is:

```text
React UI
   ↓
Pages / Components
   ↓
services/api.ts
   ↓
HTTP API
   ↓
Express Router
   ↓
Mystery Controller
   ↓
Validation / Answer Checker
   ↓
Static Data + Runtime Game State
```

The frontend does not contain the actual game rules.

The backend controls the real mystery progression.

---

# 20. Architectural Constraints

The project intentionally remains simple.

Do not introduce:

* Redux
* React Query
* RTK Query
* `createAsyncThunk`
* databases
* authentication
* JWT
* sessions
* cookies
* GraphQL
* WebSockets
* Redis
* Docker
* validation libraries
* complex error middleware
* service/repository layers
* dependency injection

The project should demonstrate understanding of:

* React
* TypeScript
* React Router
* Hooks
* Context
* Express
* REST APIs
* Controllers
* Routing
* validation
* runtime state
* frontend/backend integration

without unnecessary architectural complexity.
