# Mini Project 01 — Mystery Room

## Updated Project Structure

This document describes the target structure after the Mystery Room visual redesign. The redesign changes the frontend presentation while preserving the backend-driven gameplay model.

> Answer interaction is intentionally a free-text input. Questions do not expose selectable answer options.

---

## 1. Project Overview

Mystery Room is a browser-based interactive mystery experience. The player enters a room, reads the story, investigates clues, types answers, requests hints when needed, and progresses through the mystery step by step.

The frontend is responsible for:

- Layout and visual presentation.
- Responsive interaction.
- Text answer input.
- Loading and error states.
- Calling the API service.
- Displaying backend results and notifications.

The backend is responsible for:

- Mystery data.
- Correct answers.
- Hint text.
- Answer validation.
- Question order.
- Mystery locking and unlocking.
- Runtime gameplay state.
- Final reveals.

The backend remains the source of truth for gameplay progression.

---

## 2. Root Structure

```text
Mini-Project-01/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   └── package.json
│
├── docs/
│   ├── PROJECT-STRUCTURE.md
│   ├── API.md
│   ├── TASKS.md
│   └── TASKS-UI-REDESIGN.md
│
├── README.md
└── .gitignore
```

---

## 3. Frontend Structure

```text
client/
└── src/
    ├── assets/
    │   ├── generated/
    │   │   ├── mystery-hero-door.jpg
    │   │   ├── room-library.jpg
    │   │   ├── room-secret-passage.jpg
    │   │   ├── room-hidden-chamber.jpg
    │   │   └── room-final-reveal.jpg
    │   ├── icons/
    │   └── logo/
    │
    ├── components/
    │   ├── common/
    │   │   ├── Button.tsx
    │   │   ├── ErrorState.tsx
    │   │   ├── LoadingState.tsx
    │   │   └── Icon.tsx
    │   │
    │   ├── layout/
    │   │   ├── AppLayout.tsx
    │   │   ├── AppLayout.css
    │   │   ├── AppHeader.tsx
    │   │   ├── AppHeader.css
    │   │   ├── MobileMenu.tsx
    │   │   └── MobileMenu.css
    │   │
    │   ├── mystery/
    │   │   ├── MysteryLayout.tsx
    │   │   ├── MysteryLayout.css
    │   │   ├── RoomSidebar.tsx
    │   │   ├── RoomSidebar.css
    │   │   ├── RoomHero.tsx
    │   │   ├── RoomHero.css
    │   │   ├── RoomCard.tsx
    │   │   └── ProgressBar.tsx
    │   │
    │   ├── question/
    │   │   ├── QuestionCard.tsx
    │   │   ├── QuestionCard.css
    │   │   ├── AnswerInput.tsx
    │   │   └── AnswerFeedback.tsx
    │   │
    │   ├── hint/
    │   │   ├── HintCard.tsx
    │   │   ├── HintCard.css
    │   │   ├── HintButton.tsx
    │   │   └── HintDisplay.tsx
    │   │
    │   └── result/
    │       ├── SuccessScreen.tsx
    │       ├── SuccessScreen.css
    │       ├── FailureScreen.tsx
    │       └── FailureScreen.css
    │
    ├── pages/
    │   ├── Home/
    │   │   ├── Home.tsx
    │   │   └── Home.css
    │   ├── HowToPlay/
    │   │   ├── HowToPlay.tsx
    │   │   └── HowToPlay.css
    │   ├── Mystery/
    │   │   ├── MysteryPage.tsx
    │   │   └── MysteryPage.css
    │   ├── Result/
    │   │   ├── Result.tsx
    │   │   └── Result.css
    │   ├── About.tsx
    │   ├── About.css
    │   ├── Settings.tsx
    │   └── Settings.css
    │
    ├── routes/
    │   └── AppRouter.tsx
    │
    ├── context/
    │   ├── NotificationContext.tsx
    │   └── NotificationContext.css
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
    │   ├── global.css
    │   ├── variables.css
    │   ├── typography.css
    │   └── utilities.css
    │
    ├── App.tsx
    └── main.tsx
```

The exact creation of optional subcomponents is flexible, but responsibilities must remain separated and understandable.

---

## 4. Frontend Assets

### `assets/generated/`

Contains the generated cinematic room imagery used by the redesign:

- `mystery-hero-door.jpg`: Home hero image.
- `room-library.jpg`: Library room.
- `room-secret-passage.jpg`: Secret passage room.
- `room-hidden-chamber.jpg`: Hidden chamber room.
- `room-final-reveal.jpg`: Final reveal room.

### `assets/icons/` and `assets/logo/`

Contain reusable icons and the Mystery Room visual mark. Icons should be used consistently for locks, hints, profile, settings, menu, check, and error states.

Do not place API data, correct answers, or hint text in assets.

---

## 5. Shared Layout Components

### `components/layout/AppLayout.tsx`

Provides the shared application shell and renders the header around routed pages.

### `components/layout/AppHeader.tsx`

Provides:

- Mystery Room branding.
- Home, Play, About, and Login visual actions.
- Player and settings actions where appropriate.
- Responsive mobile menu trigger.

### `components/layout/MobileMenu.tsx`

Provides the mobile navigation drawer or collapsible navigation at narrow widths.

The layout owns presentation only. It must not own mystery progression or answer validation.

---

## 6. Mystery Components

### `components/mystery/MysteryLayout.tsx`

Composes the desktop game structure:

```text
Room Sidebar | Room Content | Question / Hint Panel
```

On mobile, the structure becomes a vertical layout with a collapsible room navigation.

### `RoomSidebar.tsx`

Displays room titles, locked/unlocked state, the active room, and progress. It must not bypass backend locking rules.

### `RoomHero.tsx`

Displays the current room image, title, and visual introduction.

### `ProgressBar.tsx`

Displays progress calculated from public gameplay state. It must not infer hidden answers.

---

## 7. Question and Answer Components

### `components/question/QuestionCard.tsx`

Displays:

- Question label.
- Question number and total.
- Current question text.
- A free-text answer field.
- Submit action.
- Loading state.
- Correct or incorrect feedback.

The answer field is intentionally:

```tsx
<input type="text" />
```

There are no radio buttons or answer options. The frontend does not know the correct answer and does not validate its content beyond preventing empty submission.

### `AnswerInput.tsx`

Owns local input value and basic empty-value handling. It sends the typed string to its parent callback.

### `AnswerFeedback.tsx`

Displays backend feedback without changing the backend result.

---

## 8. Hint Components

### `HintCard.tsx`

Displays the hint panel, hint count, returned hint, and hint action.

The actual hint text comes only from:

```text
PATCH /api/mysteries/:id/questions/:questionId/hint
```

The frontend must not preload or hardcode hint content.

---

## 9. Result Components and Pages

### `SuccessScreen.tsx`

Displays the visual success state after a correct answer or completed mystery.

### `FailureScreen.tsx`

Displays the retry state after a wrong answer where a dedicated visual state is needed.

### `pages/Result/Result.tsx`

Displays the final reveal received after the final answer and provides the next mystery action when available.

The final reveal must never be hardcoded in the frontend.

---

## 10. Pages and Routes

Required routes:

| Route | Page | Responsibility |
| --- | --- | --- |
| `/` | Home | Hero, mystery list, start action |
| `/how-to-play` | How To Play | Explain game rules |
| `/mystery/:id` | Mystery | Backend-driven gameplay |
| `/result/:id` | Result | Final reveal and progression |
| `/about` | About | Product and feature information |
| `/settings` | Settings | Presentational settings shell |

`/mystery/:id` and `/result/:id` are dynamic routes.

---

## 11. State Management

The project continues to use simple state management:

- `useState` for answer input, loading, feedback, and hint display.
- `useEffect` for loading mystery data and reacting to route changes.
- `NotificationContext` for shared toast notifications.
- Backend `gameState` for actual progression.

Redux, React Query, databases, authentication, and other forbidden technologies remain out of scope.

The frontend must not become the source of truth for:

- Correct answers.
- Solved question IDs.
- Hint text.
- Hint usage authority.
- Mystery completion.
- Final reveal.

---

## 12. Frontend API Layer

### `services/api.ts`

All requests go through this file. It provides:

```text
getMysteries()
getMysteryById(id)
submitAnswer(mysteryId, questionId, answer)
requestHint(mysteryId, questionId)
```

The answer argument is a string typed by the player. UI components must not call `fetch` directly.

---

## 13. TypeScript Types

### `types/mystery.types.ts`

Expected public types include:

```ts
interface MysteryListItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface Question {
  id: number;
  order: number;
  text: string;
  maxHints: number;
}
```

The `Question` type intentionally contains no `options` field and no answer field. The player submits free text.

---

## 14. Backend Structure

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

### Backend ownership

- `mysteries.js`: private answers, private hints, story content, final reveal, next mystery.
- `gameState.js`: current question, solved questions, hint usage, completion.
- `validation.js`: request and ID validation.
- `answerChecker.js`: normalized, case-insensitive answer comparison.
- `mystery.controller.js`: public response shaping and progression.
- `mystery.routes.js`: route-to-controller wiring only.

---

## 15. Public Data and Private Data

### Public to the frontend

- Mystery ID.
- Title and description.
- Story.
- Question ID, order, and text.
- Maximum hint count.
- Current question ID.
- Completion status.
- Hint usage counters.
- Unlock status in the collection response.

### Private on the backend

- Correct answers.
- Full hint arrays before request.
- Final reveal before completion.
- Internal runtime state details not required by the UI.

---

## 16. Development Rules

- Keep API calls in `services/api.ts`.
- Keep answer input as free text.
- Do not add answer options to public question data.
- Do not expose correct answers or hint text early.
- Do not add Redux or another state library.
- Keep layout components presentational.
- Keep gameplay progression backend-driven.
- Update `API.md` and `TASKS-UI-REDESIGN.md` when behavior changes.
- Remove unused Vite starter CSS to prevent style conflicts.

---

## 17. Completion Criteria

The updated structure is correctly implemented when:

- All target routes exist.
- Generated room images are integrated.
- Home and gameplay layouts match the reference direction.
- Desktop and mobile layouts work.
- Answers are typed into a text input.
- Hints are requested from the API.
- Result and notification states are visible.
- API and TypeScript types agree.
- The frontend builds successfully.
