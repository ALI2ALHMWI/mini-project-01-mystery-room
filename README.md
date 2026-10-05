# Mini Project 01 — Mystery Room

A browser-based interactive mystery game built with React, TypeScript, Node.js, and Express.

Players enter a mystery, read the story, inspect the clues, answer free-text questions, request hints when necessary, and progress through a sequence of mysteries. The backend controls the real gameplay state and keeps hidden answers and unrevealed hints private.

## 1. Main Features

- Three connected mysteries with an English story and clue system.
- Free-text answers instead of multiple-choice options.
- Case-insensitive answer checking with surrounding whitespace ignored.
- Questions must be solved in order.
- Maximum of two hints per question.
- Mystery locking and unlocking based on completion.
- Final reveal only after the final question is solved.
- Dedicated mystery exploration/introduction screen before gameplay.
- Loading, API error, and network-failure states.
- Responsive desktop and mobile UI.
- React Router navigation.
- In-memory backend state; no authentication or database is required.

## 2. Gameplay Flow

```text
Home
  ↓
Mystery List
  ↓
Explore Mystery
  ↓
Start Investigation
  ↓
Question 1
  ↓
Answer / Hint
  ↓
Correct?
 ├── No → Retry
 └── Yes → Next Question
              ↓
          Final Question
              ↓
        Mystery Completed
              ↓
          Final Reveal
              ↓
        Next Mystery
```

A player cannot skip the active question. The backend validates progression independently from the frontend.

## 3. Current Mysteries

| ID | Title | Theme | Next |
| --- | --- | --- | --- |
| mystery-1 | The Five O'Clock Coffee | Poison hidden in melting ice | mystery-2 |
| mystery-2 | The Rainy Gallery | False alibi during a storm | mystery-3 |
| mystery-3 | The Midnight Flight | Opportunity during a cabin blackout | None |

The content is stored in `server/src/data/mysteries.js`. Correct answers, hint text, and final reveals are backend-only until the appropriate gameplay action.

## 4. Technology Stack

### Frontend
- React
- TypeScript
- React Router
- React Hooks
- `useState`
- `useEffect`
- Context API
- CSS

### Backend
- Node.js
- Express
- JavaScript
- ES Modules
- Express Router

### Development
- Git
- Feature branches
- Pull Requests

## 5. State Management

The project intentionally uses simple state management.

### Frontend
API-driven pages use explicit React state:

```text
useState
  ↓
load...()
  ↓
try / catch / finally
  ↓
useEffect()
  ↓
loading / error / data UI
```

Route-dependent pages reload when the mystery ID changes. The backend remains the source of truth for gameplay progression.

### Shared UI state
`NotificationContext` is used for application-wide notifications.

### Backend
`server/src/data/gameState.js` stores temporary in-memory progression:

- current question
- solved question IDs
- hints used
- completion state

Restarting the server resets this state.

## 6. Project Structure

```text
Mini-Project-01/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── mystery/
│   │   │   ├── question/
│   │   │   ├── hint/
│   │   │   └── result/
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── HowToPlay/
│   │   │   ├── Mystery/
│   │   │   ├── Result/
│   │   │   ├── About.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── NotFound.tsx
│   │   ├── routes/
│   │   ├── context/
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── mystery.types.ts
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── data/
│   │   └── utils/
│   └── package.json
├── docs/
│   ├── API.md
│   ├── PROJECT-STRUCTURE.md
│   └── TASKS.md
├── README.md
└── .gitignore
```

See `docs/PROJECT-STRUCTURE.md` for detailed responsibilities.

## 7. Frontend Routes

| Route | Purpose |
| --- | --- |
| `/` | Home and mystery selection |
| `/how-to-play` | Game instructions |
| `/mystery/:id/explore` | Mystery introduction and story |
| `/mystery/:id` | Active mystery gameplay |
| `/result/:id` | Completed mystery and final reveal |
| `/about` | Project information |
| `/settings` | Settings UI |
| `*` | Not Found page |

## 8. API

The frontend communicates with the backend through:

```text
client/src/services/api.ts
```

Available endpoints:

```http
GET   /api/mysteries
GET   /api/mysteries/:id
POST  /api/mysteries/:id/questions/:questionId/answer
PATCH /api/mysteries/:id/questions/:questionId/hint
```

For request and response contracts, see `docs/API.md`.

## 9. Information Exposure

The frontend must never receive hidden solution data before it is needed.

A normal mystery response contains:

- story
- question text
- question order
- current question
- hint usage count
- completion status

It does not contain:

- correct answers
- full hint arrays
- final reveal before completion

The actual hint is returned only by the hint endpoint. The final reveal is returned only after the final answer is correct.

## 10. Error Handling

The API contract uses:

- `200` for successful requests and wrong-answer gameplay results.
- `400` for invalid input or invalid gameplay actions.
- `403` for locked mysteries.
- `404` for missing mysteries/questions/routes.
- `500` for unexpected server errors.
- Network errors are converted into a user-facing recoverable error by the frontend API layer.

The UI must never fail into a blank page because of an API error.

## 11. Running the Project

### Backend

```bash
cd server
npm install
npm run dev
```

Default backend URL:

```text
http://localhost:5000
```

### Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The Vite development server normally runs on:

```text
http://localhost:5173
```

The frontend API base can be overridden with `VITE_API_BASE_URL`; otherwise it uses `/api`.

## 12. Development Rules

- Keep all frontend HTTP requests inside `services/api.ts`.
- Keep data loading in API-driven pages using `useState`, `useEffect`, and explicit `load...` functions.
- Keep presentational components focused on rendering and callbacks.
- Do not expose answers or unrevealed hints in frontend data.
- Keep gameplay progression backend-driven.
- Do not add unnecessary architecture or libraries.
- Do not push directly to `main`; use a feature branch and Pull Request.

## 13. Intentionally Out of Scope

The project does not require:

- Redux
- React Query / RTK Query
- Database
- Authentication
- JWT
- Sessions or cookies
- GraphQL
- WebSockets
- Redis
- Docker
- Service/repository/DI layers

The goal is a clear React + Express implementation with simple state management.

## 14. Documentation

- `docs/API.md` — endpoint and data contract.
- `docs/PROJECT-STRUCTURE.md` — actual project architecture and responsibilities.
- `docs/TASKS.md` — team ownership, workflow, and completion criteria.

## 15. QA Checklist

Before submission, verify:

- Home loads all mysteries.
- Locked mysteries cannot be opened through the API.
- Mystery exploration loads correctly.
- Gameplay loads the correct current question.
- Wrong answers do not advance the game.
- Correct answers advance the game.
- Questions cannot be skipped.
- First and second hints work.
- Third hint is rejected.
- Mystery completion works.
- Next mystery unlocks.
- Final reveal is not exposed early.
- Result navigation works.
- Invalid IDs show errors instead of blank pages.
- Network/server failures show recoverable UI.
- Desktop and mobile layouts work.
