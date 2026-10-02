# Mini Project 01 — Tasks & Team Workflow

## 1. Team

| Member           | Main Task                                     | Area     |
| ---------------- | --------------------------------------------- | -------- |
| Ali Al Hamwi     | Question & Hint UI + Notifications            | Frontend |
| Yousef Yousef    | Mystery Gameplay + API Service + Types        | Frontend |
| Nagham Jaza      | Routing + Pages + Application Structure       | Frontend |
| Nawar Hasan      | Validation + Answer Checking                  | Backend  |
| Laith Haj Hosin  | Mystery Controller + Game State + Progression | Backend  |
| Mohammad Kashmar | API Routes + Endpoint Testing                 | Backend  |

---

# 2. Important Team Rules

### Everyone must understand the whole project

Each member is responsible for one implementation area, but this does **not** mean that members only need to understand their own code.

Before the final presentation, every member must understand:

* the complete user flow
* frontend structure
* backend structure
* API endpoints
* game state
* answer validation
* hints
* error handling
* how frontend communicates with backend
* how the mystery is completed

The project specification explicitly requires all team members to be able to explain the whole project and participate in the English presentation.

---

# 3. Technology Decisions

## Frontend

* React
* TypeScript
* React Router
* Hooks
* `useState`
* `useEffect`
* Context API only where genuinely shared
* LocalStorage only if actually useful
* No Redux

## Backend

* Node.js
* Express
* JavaScript
* ES Modules
* Express Router
* Controllers
* Utils
* In-memory runtime state

## Forbidden Technologies

Do not introduce:

* Redux
* React Query
* RTK Query
* `createAsyncThunk`
* database
* authentication
* JWT
* sessions
* cookies
* GraphQL
* WebSockets
* Redis
* Docker
* validation libraries
* complex middleware architecture
* service/repository/DI layers

These restrictions follow the project specification.

---

# 4. File Ownership

To avoid conflicts, each area has a clear owner.

## Frontend

### Nagham owns

```text
client/src/
├── pages/
├── routes/
├── App.tsx
├── main.tsx
└── styles/
```

### Yousef owns

```text
client/src/
├── services/
│   └── api.ts
├── types/
│   └── mystery.types.ts
└── pages/Mystery/
```

### Ali owns

```text
client/src/
├── components/question/
├── components/hint/
├── context/
└── hooks/              # only if needed specifically for his UI
```

## Backend

### Nawar owns

```text
server/src/utils/
├── validation.js
└── answerChecker.js
```

### Laith owns

```text
server/src/controllers/
└── mystery.controller.js

server/src/data/
├── mysteries.js
└── gameState.js
```

### Mohammad owns

```text
server/src/routes/
└── mystery.routes.js
```

### Important

Do not modify another member's owned files unless the team agrees first.

If you need something from another area, communicate with its owner instead of changing their code.

---

# 5. Task 1 — Ali Al Hamwi

## Question & Hint UI + Notifications

### Main responsibility

Build the reusable UI responsible for:

* displaying the current question
* entering an answer
* submitting an answer
* requesting a hint
* displaying wrong-answer feedback
* displaying correct-answer feedback
* displaying hint information
* limiting hints to 2
* showing notifications after correct answers

The project requires an interactive answer/decision input and proper loading/error handling.

---

## Files

Main ownership:

```text
client/src/components/question/
client/src/components/hint/
client/src/context/NotificationContext.tsx
```

If a small custom hook is genuinely required for this UI:

```text
client/src/hooks/
```

---

## Required components

The exact component names are flexible, but the responsibility should be separated.

Example:

```text
components/
├── question/
│   ├── QuestionCard.tsx
│   ├── AnswerInput.tsx
│   └── AnswerFeedback.tsx
│
└── hint/
    ├── HintButton.tsx
    ├── HintDisplay.tsx
    └── HintCounter.tsx
```

---

## Answer UI requirements

The user must be able to:

1. see the current question
2. type one answer
3. submit the answer
4. see loading state while submitting
5. see a clear wrong-answer message
6. remain on the same question after a wrong answer
7. continue only after a correct answer

Answers are case-insensitive.

Example:

```text
Shadow
shadow
SHADOW
sHaDoW
```

must all be treated as the same answer.

---

## Hint requirements

Each question has:

```text
maximum = 2 hints
```

The UI must:

* show how many hints have been used/remaining
* request hints through the API service
* show the returned hint
* disable the hint action when no hints remain
* display an appropriate error if the backend rejects the request

The frontend must NOT contain the actual mystery hint text.

The backend is the source of truth for hints.

---

## Notification Context

Create:

```text
client/src/context/NotificationContext.tsx
```

Use Context for notifications because notifications can be triggered by gameplay components but displayed at a higher application level.

After every correct answer, display a notification such as:

```text
Correct answer!
```

The exact visual design is up to the team.

---

## Ali must NOT

Ali should not implement:

* API request functions
* mystery fetching
* routing
* Mystery page structure
* backend controllers
* backend routes
* answer validation utility
* game-state logic

Ali imports and uses the API functions created by Yousef.

---

## Definition of Done

* Answer input works.
* Submit action works.
* Loading state exists.
* Wrong-answer feedback exists.
* Correct-answer feedback exists.
* Hint button works through the API layer.
* Maximum of 2 hints is respected.
* Notification Context works.
* Correct answer triggers a notification.
* UI works on desktop and mobile.
* No API calls are written directly inside these components.
* Code is committed and pushed on Ali's branch.
* Ali can explain the full project flow.

---

# 6. Task 2 — Yousef Yousef

## Mystery Gameplay + API Service + TypeScript Types

### Main responsibility

Build the connection between the Mystery page and the backend API.

Yousef owns the gameplay screen's data flow, but **does not own the individual question/hint UI components**.

The frontend must have a backend-driven screen and all API calls must go through a helper layer.

---

## Files

```text
client/src/pages/Mystery/
client/src/services/api.ts
client/src/types/mystery.types.ts
```

---

## Part A — Mystery Gameplay Page

Build the main Mystery gameplay screen.

It should:

1. read the mystery ID from the URL
2. request the mystery from the backend
3. display loading state
4. display API/network errors
5. display mystery information
6. determine the current question
7. provide the question UI with the required data/callbacks
8. update gameplay after a correct answer
9. move to the next question
10. detect mystery completion
11. navigate to the Result page after completion

Expected route:

```text
/mystery/:id
```

The URL owns the current mystery.

---

## Gameplay flow

```text
URL
 ↓
mysteryId
 ↓
GET /api/mysteries/:id
 ↓
Loading
 ↓
Mystery data
 ↓
Current question
 ↓
User answers
 ↓
POST answer
 ↓
Correct?
 ├── No → stay on same question
 │
 └── Yes
      ↓
   next question
      ↓
   or mystery completed
      ↓
   Result page
```

Questions must be solved in order.

---

# Part B — API Service

Create:

```text
client/src/services/api.ts
```

All frontend HTTP requests must go through this file.

Required functions:

```text
getMysteries()
getMysteryById(id)
submitAnswer(mysteryId, questionId, answer)
requestHint(mysteryId, questionId)
```

Components/pages should NOT directly call `fetch`.

---

## API service responsibilities

The API layer should:

* build endpoint URLs
* send requests
* parse JSON
* handle HTTP errors
* return useful data to the UI
* expose enough information for the UI to display errors

Do not create a complicated service/repository architecture.

One simple API helper file is enough.

---

# Part C — TypeScript Types

Create:

```text
client/src/types/mystery.types.ts
```

Define the frontend types for:

* Mystery
* Question
* Answer response
* Hint response
* Mystery list item
* API error response

Types must match the actual API contract.

Do not duplicate types unnecessarily inside components.

---

# Error Handling

Yousef must make sure the Mystery page can handle:

### 400

Examples:

* invalid answer
* invalid gameplay action
* no hints remaining

### 404

Examples:

* mystery does not exist
* question does not exist

### Network/server failure

Example:

```text
Unable to connect to the server.
Please try again.
```

The user should never be left with a blank screen.

---

# Yousef must NOT

Yousef should not implement:

* Question UI internals
* Hint UI internals
* Notification Context
* backend controller
* backend routes
* answer validation
* answer comparison logic
* final story content

Ali owns the question/hint UI.

Laith owns the backend game progression.

---

# Definition of Done

* `/mystery/:id` works.
* Mystery data is fetched from the backend.
* All requests use `services/api.ts`.
* No direct `fetch` calls exist inside UI components.
* TypeScript types exist and are used.
* Loading state exists.
* Error state exists.
* 400 errors are handled.
* 404 errors are handled.
* Network/server errors are handled.
* Questions progress correctly after successful answers.
* Completion is detected.
* Result page navigation works.
* Code is committed and pushed on Yousef's branch.
* Yousef can explain the full project flow.

---

# 7. Task 3 — Nagham Jaza

## Routing + Pages + Application Structure

### Main responsibility

Build the overall frontend application structure.

The specification requires at least 3 meaningful routes and at least 1 dynamic route.

---

## Files

```text
client/src/
├── pages/
├── routes/
├── App.tsx
├── main.tsx
└── styles/
```

---

## Routes

Implement at least:

```text
/
```

Home page

```text
/how-to-play
```

How To Play page

```text
/mystery/:id
```

Dynamic Mystery page

```text
/result/:id
```

Result/Completion page

---

## Home Page

The Home page should:

* introduce the game
* explain the basic goal
* provide a way to start
* navigate to an available mystery

The exact visual design can be decided by the team.

---

## How To Play Page

Explain:

* solve questions in order
* one answer per question
* answers are case-insensitive
* maximum 2 hints per question
* wrong answers allow retry
* correct answers unlock the next question
* completing a mystery unlocks the next mystery

---

## Result Page

The Result page is required.

It must support:

* mystery completion
* final reveal
* next mystery action when available
* final completion when no next mystery exists
* appropriate navigation

The final reveal must come from the backend completion response, not hardcoded in the frontend.

---

## Router

Create:

```text
client/src/routes/AppRouter.tsx
```

Configure React Router.

Use:

```text
/mystery/:id
```

as the dynamic route.

---

## Global Application Structure

Nagham owns:

```text
App.tsx
main.tsx
AppRouter.tsx
```

and the global styling foundation.

---

# CSS / Design System

Create and maintain centralized design tokens.

Example:

```css
:root {
  --color-bg: #0f1117;
  --color-surface: #181b24;
  --color-surface-light: #222633;
  --color-primary: #8b5cf6;
  --color-primary-hover: #7c3aed;
  --color-text: #f5f5f5;
  --color-text-muted: #a1a1aa;
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-border: #303442;
}
```

Typography:

* Page title: 32px
* Section title: 24px
* Question: 22px
* Body: 16px
* Secondary text: 14px
* Button: 16px

Spacing:

```text
4
8
12
16
24
32
48
64
```

Use consistent:

* colors
* typography
* spacing
* borders
* radii
* buttons
* inputs
* cards

---

## Responsive Design

The frontend must work on:

* desktop
* tablet
* mobile

This includes:

* question UI
* mystery screen
* result screen
* navigation
* buttons
* inputs
* cards

---

## Nagham must NOT

Nagham should not implement:

* API functions
* backend logic
* answer checking
* question/hint internals
* Notification Context

Nagham may import and use components created by Ali and pages/data flow created by Yousef.

---

## Definition of Done

* At least 3 meaningful routes exist.
* Dynamic mystery route works.
* Home page works.
* How To Play page works.
* Result page works.
* Router works.
* Application structure is clean.
* Global styling system exists.
* Responsive layout works.
* No Redux is used.
* Code is committed and pushed on Nagham's branch.
* Nagham can explain the full project flow.

---

# 8. Task 4 — Nawar Hasan

## Validation + Answer Checking

### Main responsibility

Create the backend utility functions responsible for validating input and checking answers.

---

## Files

```text
server/src/utils/validation.js
server/src/utils/answerChecker.js
```

---

## validation.js

Implement simple validation functions for:

* required answer field
* answer must be a string
* answer must not be empty
* required IDs
* request body validation where appropriate

Invalid input must result in a condition that the controller can convert into HTTP 400.

The project specifically requires 400 responses for missing or wrong-type required fields.

---

## answerChecker.js

Implement case-insensitive answer checking.

Example:

```text
"shadow"
"Shadow"
"SHADOW"
```

must be treated as equal.

The function should:

* trim unnecessary whitespace
* compare normalized values
* return a simple result

Keep it pure.

---

## Nawar must NOT

Do not:

* access Express request/response objects
* modify game state
* query routes
* create controllers
* create API endpoints

These utilities should be reusable and independent.

---

## Definition of Done

* Validation functions work.
* Empty answers are rejected.
* Non-string answers are rejected.
* Answers are normalized.
* Comparison is case-insensitive.
* Utility functions are simple and testable.
* Code is committed and pushed.
* Nawar can explain how validation works in the complete request flow.

---

# 9. Task 5 — Laith Haj Hosin

## Mystery Controller + Game State + Progression

### Main responsibility

Implement the actual game logic on the backend.

The backend is the source of truth for mystery state.

The specification requires shared in-memory runtime state.

---

## Files

```text
server/src/controllers/mystery.controller.js

server/src/data/mysteries.js
server/src/data/gameState.js
```

---

# Static Mystery Data

Create mock data containing:

* mystery ID
* title
* description
* story
* questions
* question order
* correct answer
* hints
* final reveal
* next mystery ID

Example:

```text
Mystery 1
 ├── Question 1
 ├── Question 2
 └── Question 3
       ↓
    Mystery 2
```

The exact final story and clues will be created later as a team.

---

# Runtime State

Keep runtime state separate from static mystery data.

Example concept:

```text
gameState.mysteries[mysteryId]
```

State may contain:

```text
currentQuestionId
solvedQuestionIds
hintsUsed
completed
```

---

# Controller responsibilities

Implement the logic for:

### GET collection

Return available mystery information.

Do not expose:

* answers
* actual hint text
* other hidden solution information

---

### GET mystery

Return:

* mystery information
* story
* questions
* question IDs
* order
* question text
* `maxHints: 2`

Do NOT return:

* correct answers
* actual hint text
* final reveal before completion

---

### POST answer

Handle:

```text
POST /api/mysteries/:id/questions/:questionId/answer
```

Responsibilities:

1. validate request
2. find mystery
3. find question
4. verify question is the current question
5. check answer
6. return wrong-answer response when incorrect
7. keep user on same question after wrong answer
8. mark question as solved when correct
9. move to next question
10. complete mystery when final question is solved
11. return final reveal only when mystery is completed
12. expose next mystery information only after completion

---

### PATCH hint

Handle:

```text
PATCH /api/mysteries/:id/questions/:questionId/hint
```

Responsibilities:

1. find mystery
2. find question
3. verify current question
4. check hints used
5. reject third hint
6. return the next hint
7. update runtime hint count

Maximum:

```text
2 hints/question
```

---

# Progression rules

Questions must be solved in order.

If current question is:

```text
Question 2
```

the user cannot submit an answer for:

```text
Question 3
```

until Question 2 is correctly solved.

Wrong answer:

```text
Stay on current question.
```

Correct answer:

```text
Move to next question.
```

Final correct answer:

```text
Complete mystery.
Return final reveal.
Unlock/identify next mystery if one exists.
```

---

# Important information-exposure rule

The GET mystery endpoint must NOT send the actual hint text.

It should expose only:

```json
{
  "id": "question-1",
  "order": 1,
  "text": "..."
  "maxHints": 2
}
```

The actual hint is returned only through:

```text
PATCH /api/mysteries/:id/questions/:questionId/hint
```

The final reveal is returned only after the final answer is correct.

---

## Laith must NOT

Do not:

* create Express routes
* create validation utilities
* write frontend code
* add a database
* add authentication
* create service/repository layers

---

## Definition of Done

* Static mock data exists.
* Runtime state exists separately.
* GET collection works through the controller.
* GET mystery works.
* Answers are never exposed through GET.
* Hint text is never exposed through GET.
* Final reveal is not exposed before completion.
* POST answer works.
* Wrong answers remain on the same question.
* Correct answers advance the game.
* Questions cannot be skipped.
* PATCH hint works.
* Third hint is rejected.
* Mystery completion works.
* Next mystery progression works.
* 400/404 conditions are handled.
* Code is committed and pushed.
* Laith can explain the complete game-state flow.

---

# 10. Task 6 — Mohammad Kashmar

## API Routes + Endpoint Testing

### Main responsibility

Create the Express Router and connect endpoints to the controller.

The specification requires `express.Router()` and mounting the router from the application entry point.

---

## File

```text
server/src/routes/mystery.routes.js
```

---

# Required endpoints

```text
GET /api/mysteries
```

```text
GET /api/mysteries/:id
```

```text
POST /api/mysteries/:id/questions/:questionId/answer
```

```text
PATCH /api/mysteries/:id/questions/:questionId/hint
```

---

# Route responsibilities

The router should:

* define endpoint paths
* define HTTP methods
* connect each endpoint to the correct controller
* remain simple

Do not put game logic inside the router.

---

# Endpoint testing

Test endpoints independently.

At minimum verify:

## GET collection

```text
200
```

## GET existing mystery

```text
200
```

## GET invalid mystery

```text
404
```

## POST correct answer

```text
200
```

## POST wrong answer

```text
200
```

because a wrong answer is a valid gameplay result.

## POST invalid body

```text
400
```

## PATCH hint

```text
200
```

## PATCH third hint

```text
400
```

## PATCH invalid mystery/question

```text
404
```

The project specifically requires endpoint testing independently from the frontend.

---

## Mohammad must NOT

Do not:

* implement game logic
* validate answers directly
* create frontend code
* modify controller logic unless coordinating with Laith

---

## Definition of Done

* Router exists.
* All required endpoints are registered.
* Router is mounted correctly.
* Successful responses work.
* 400 cases work.
* 404 cases work.
* Endpoints are tested independently.
* Code is committed and pushed.
* Mohammad can explain the complete API flow.

---

# 11. Shared Team Task — Original Story & Mystery Content

This is a **team responsibility**, not an extra individual task.

The project requires original theme/story/clue content and an intentional visual identity.

After the technical structure is working, the whole team decides:

* mystery theme
* story
* characters
* clues
* questions
* correct answers
* hints
* final reveal
* second mystery if used
* visual identity

The current mock data is only for development.

Before final submission, mock content must be replaced with the team's final mystery content.

---

# 12. Shared Team Task — Final Integration Test

After all six tasks are merged, the entire team performs one complete end-to-end test.

Test:

```text
Home
 ↓
Start Mystery
 ↓
Mystery Page
 ↓
Question 1
 ↓
Wrong Answer
 ↓
Retry
 ↓
Hint
 ↓
Correct Answer
 ↓
Question 2
 ↓
...
 ↓
Final Question
 ↓
Final Reveal
 ↓
Next Mystery
 ↓
Final Completion
```

Also test:

* invalid mystery ID
* invalid question ID
* empty answer
* non-string answer
* wrong answer
* correct answer
* third hint
* network/server error
* page refresh
* mobile layout

The full mystery must be playable from beginning to end, and endpoint failure cases must work.

---

# 13. Shared Team Task — README & Documentation

The repository must contain clear setup instructions.

README should explain:

* project description
* technologies
* folder structure
* how to install frontend
* how to install backend
* how to run frontend
* how to run backend
* API overview
* gameplay rules
* team members

The specification requires a README with install/start instructions and a clean checkout that runs successfully.

---

# 14. Git Workflow

Each member works on a separate branch.

Before starting:

```bash
git checkout main
git pull origin main
```

Create branch:

```bash
git checkout -b feature/your-task-name
```

Examples:

```text
feature/question-ui
feature/mystery-gameplay
feature/frontend-routing
feature/answer-checker
feature/mystery-controller
feature/api-routes
```

After work:

```bash
git status
git add .
git commit -m "feat: describe the change"
git push -u origin feature/your-task-name
```

Then create a Pull Request.

---

# 15. Git Rules

* Do not push directly to `main`.
* One main task = one branch.
* Make meaningful commits.
* Pull the latest `main` before starting.
* Do not overwrite another member's work.
* Discuss cross-task changes before making them.
* PRs should be reviewed before merging.
* Keep commits understandable.

---

# 16. Dependency Order

The recommended implementation order is:

### Phase 1 — Backend foundation

1. Nawar — validation + answer checker
2. Laith — data + game state + controller
3. Mohammad — routes + endpoint testing

### Phase 2 — Frontend foundation

4. Nagham — routing + pages + application structure
5. Yousef — API service + types + Mystery gameplay
6. Ali — question/hint components + notifications

### Phase 3 — Integration

All members:

* connect frontend to backend
* replace mock frontend assumptions with real API data
* verify error handling
* verify question progression
* verify hints
* verify completion
* verify result page

### Phase 4 — Content

All members:

* final story
* final clues
* final answers
* final hints
* final reveal
* visual identity

### Phase 5 — Final QA

All members:

* full mystery playthrough
* endpoint testing
* responsive testing
* error testing
* README
* Git history review
* presentation preparation

---

# 17. Final Project Definition of Done

The project is considered complete only when:

### Frontend

* React + TypeScript
* React Router
* 3+ meaningful routes
* dynamic mystery route
* backend-driven mystery screen
* API helper layer
* loading states
* error states
* answer input
* hint interaction
* notification system
* result/completion screen
* responsive UI

### Backend

* Node.js + Express
* Express Router
* Controllers
* in-memory runtime state
* GET collection
* GET mystery
* POST answer
* PATCH hint
* validation
* 400 responses
* 404 responses
* independent endpoint testing

### Gameplay

* one answer per question
* case-insensitive answers
* questions solved in order
* wrong answer = retry
* maximum 2 hints/question
* correct answer = next question
* mystery completion
* final reveal
* next mystery progression

### Project Quality

* original story
* original clues
* intentional visual identity
* responsive design
* clean folder structure
* no forbidden technologies
* meaningful Git history
* README
* full end-to-end test
* every member understands the whole project
* every member can participate in the presentation

These completion requirements align with the project's stated functional, technical, Git, and presentation expectations.
