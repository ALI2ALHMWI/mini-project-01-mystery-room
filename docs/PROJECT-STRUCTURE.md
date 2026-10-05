# Mini Project 01 — Mystery Room

## 1. Purpose

This document describes the current architecture of the Mystery Room project.

The project is intentionally simple: React + TypeScript on the frontend, Node.js + Express on the backend, a small API service layer, and in-memory gameplay state.

The backend is the source of truth for mystery progression and hidden solution data.

## 2. Root Structure

```text
Mini-Project-01/
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   └── package.json
├── docs/
│   ├── API.md
│   ├── PROJECT-STRUCTURE.md
│   └── TASKS.md
├── README.md
└── .gitignore
```

## 3. Frontend Structure

```text
client/src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── mystery/
│   ├── question/
│   ├── hint/
│   └── result/
├── pages/
│   ├── Home/
│   ├── HowToPlay/
│   ├── Mystery/
│   │   ├── MysteryPage.tsx
│   │   ├── MysteryPage.css
│   │   ├── MysteryIntroPage.tsx
│   │   └── MysteryIntroPage.css
│   ├── Result/
│   ├── About.tsx
│   ├── About.css
│   ├── Settings.tsx
│   ├── Settings.css
│   ├── NotFound.tsx
│   └── NotFound.css
├── routes/
│   └── AppRouter.tsx
├── context/
│   └── NotificationContext.tsx
├── hooks/
├── services/
│   └── api.ts
├── types/
│   └── mystery.types.ts
├── styles/
├── App.tsx
└── main.tsx
```

### 3.1 API-driven pages

The pages that own server data use a consistent React pattern:

```tsx
const [data, setData] = useState(...);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(...);

const loadData = useCallback(async () => {
  setIsLoading(true);
  setError(null);

  try {
    const result = await fetchData();
    setData(result);
  } catch (error) {
    setError(...);
  } finally {
    setIsLoading(false);
  }
}, [...]);

useEffect(() => {
  loadData();
}, [loadData]);
```

Current API-driven pages:

- `Home.tsx` — loads the mystery collection.
- `MysteryIntroPage.tsx` — loads the selected mystery before investigation.
- `MysteryPage.tsx` — loads the selected mystery and public mystery list.
- `Result.tsx` — revalidates the selected mystery before showing the final result.

The explicit loader pattern keeps loading, error, retry, and route-change behavior easy to understand.

## 4. Page Responsibilities

### Home

Loads the public mystery collection and displays:

- mystery cards
- locked/unlocked status
- start/explore actions
- loading state
- error state

It does not contain answers or hidden hints.

### How To Play

Static instructional page. It does not need an API request.

### MysteryIntroPage

Route:

```text
/mystery/:id/explore
```

Loads the selected mystery and presents:

- title
- description
- story
- question count
- hint information
- Start Investigation action

If the mystery is already completed, the page redirects to the result page.

### MysteryPage

Route:

```text
/mystery/:id
```

Owns the active gameplay data flow:

1. read the mystery ID
2. load mystery data
3. load the public mystery list
4. determine the backend-provided current question
5. render the question and hint components
6. submit answers through the API service
7. request hints through the API service
8. refresh/reconcile backend state after successful progression
9. navigate to the result page after completion

The page does not know the correct answer or full hint text before the API returns it.

### Result

Route:

```text
/result/:id
```

Revalidates the mystery from the backend. It displays the final reveal only when the backend reports completion and provides navigation to the next mystery when available.

## 5. Component Responsibilities

### Layout

Presentational application shell and responsive navigation.

### Mystery components

- `RoomHero` — visual room introduction and navigation to the exploration page.
- `RoomSidebar` — room list, active room, and backend-provided unlock state.
- Other mystery layout components — composition and presentation.

### Question components

Display the current public question, collect the player's free-text answer, and report the action to the page.

They do not know the correct answer.

### Hint components

Request/display the hint returned by the API and show remaining hint count.

They do not contain hardcoded secret hints.

### Result components

Render success/completion states and invoke callbacks supplied by the result page.

## 6. Backend Structure

```text
server/src/
├── controllers/
│   └── mystery.controller.js
├── routes/
│   └── mystery.routes.js
├── data/
│   ├── mysteries.js
│   └── gameState.js
└── utils/
    ├── validation.js
    └── answerChecker.js
```

### mysteries.js

Static game content:

- English mystery title
- description
- story
- ordered questions
- correct answers
- hidden hints
- final reveal
- next mystery ID

This is private backend data.

### gameState.js

In-memory runtime state:

```text
mysteries[mysteryId]
  ├── currentQuestionId
  ├── solvedQuestionIds
  ├── hintsUsed
  └── completed
```

Server restart resets all progress.

### mystery.controller.js

Responsible for:

- finding mysteries/questions
- validating gameplay state
- shaping public responses
- enforcing question order
- checking answers
- advancing progression
- limiting hints
- unlocking later mysteries
- returning the final reveal after completion

### validation.js

Validates request IDs and answer payloads.

### answerChecker.js

Normalizes answers with trim + lowercase comparison.

### mystery.routes.js

Defines the API endpoints and connects them to controller functions. Game logic does not belong in the router.

## 7. Data Exposure Boundary

### Safe public data

```text
Mystery ID
Title
Description
Story
Question ID
Question order
Question text
maxHints
Current question ID
Completion status
Hints used
Unlock status
```

### Backend-only data

```text
Correct answers
Full hint arrays
Unreleased final reveal
Internal runtime details
```

The boundary is enforced by `toPublicQuestion`, `toPublicMystery`, and the controller flow.

## 8. API Service

```text
client/src/services/api.ts
```

Exports:

```text
getMysteries()
getMysteryById(id)
submitAnswer(mysteryId, questionId, answer)
requestHint(mysteryId, questionId)
```

It centralizes:

- API base URL
- request creation
- JSON parsing
- HTTP error mapping
- network error mapping
- typed responses

Components/pages should not call `fetch` directly.

## 9. TypeScript Contract

`client/src/types/mystery.types.ts` mirrors the public API.

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

The public `Question` type intentionally has no answer, hint array, or multiple-choice options.

## 10. Routing

The current routes are:

| Route | Responsibility |
| --- | --- |
| `/` | Home |
| `/how-to-play` | Instructions |
| `/mystery/:id/explore` | Mystery introduction |
| `/mystery/:id` | Gameplay |
| `/result/:id` | Completion/result |
| `/about` | About |
| `/settings` | Settings |
| `*` | Not Found |

## 11. Error and Loading Strategy

API-driven pages must provide:

- loading UI while requests are pending
- explicit error UI for API/network failures
- empty-state handling where appropriate
- retry/reload behavior where the page supports it

The API service converts HTTP and network failures into typed `ApiError` instances.

A failed request must never leave the page blank.

## 12. Architecture Rules

- No direct `fetch` from UI components.
- No Redux or React Query.
- No database or authentication.
- No answer/options data in public question objects.
- No hardcoded hidden hints in frontend components.
- No client-side authority over question progression.
- Keep API-driven page loading explicit with `useState`, `useEffect`, and loader functions.
- Keep presentational components free from unnecessary data-fetching responsibilities.
- Keep static content separate from runtime state.
- Update API documentation whenever the response contract changes.

## 13. Current Mystery Content

The backend currently contains three English mysteries:

1. **The Five O'Clock Coffee** — the poison is hidden in melting ice cubes.
2. **The Rainy Gallery** — a false shelter claim exposes the thief.
3. **The Midnight Flight** — a seat sensor establishes who left their seat during the blackout.

Each mystery contains three ordered questions and up to two hints per question.

## 14. Development and QA

Before merging gameplay changes, verify:

- collection loading
- mystery locking
- exploration page
- current-question selection
- wrong answer retry
- correct answer progression
- hint 1
- hint 2
- hint limit
- question-order enforcement
- completion
- final reveal
- next mystery unlocking
- result navigation
- 404 route
- API/network error UI
- responsive behavior
