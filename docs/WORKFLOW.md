# Mystery Room — Full Project Workflow

## 1. Purpose
This document explains the complete workflow of the Mystery Room project: how the frontend loads data, how pages communicate with components, how requests travel through the API to Express controllers, how runtime gameplay state is updated, and how responses return to the UI.

## 2. Architecture
```text
USER → React Router → Page → Components → services/api.ts
                                      ↓ HTTP / JSON
                                Express Server
                                      ↓
                              Routes → Controllers
                                      ↓
                         mysteries.js + gameState.js
                                      ↓
                                  JSON response
                                      ↓
                              api.ts → Page state
                                      ↓
                                  Components
```

> Backend owns gameplay truth. Pages own data flow. Components own presentation and user interaction. `api.ts` connects frontend and backend.

## 3. Responsibilities
### Frontend
- Render pages and components.
- Collect user input.
- Manage loading, error, feedback, and temporary UI state.
- Call the API only through `services/api.ts`.
- Navigate between routes.
- Display backend data.

### API service
`client/src/services/api.ts` is the frontend HTTP boundary. It builds URLs, sends requests, parses JSON, maps HTTP/network failures to `ApiError`, and returns typed data.

### Backend
- Validate requests.
- Find mysteries and questions.
- Enforce unlock rules.
- Enforce question order.
- Check answers.
- Track hints and completion.
- Return only data that the client is allowed to know.

## 4. Application Startup
```text
main.tsx → App.tsx → AppRouter.tsx → AppHeader + selected Route
```
| Route | Page |
|---|---|
| `/` | Home |
| `/how-to-play` | HowToPlay |
| `/mystery/:id/explore` | MysteryIntroPage |
| `/mystery/:id` | MysteryPage |
| `/result/:id` | Result |
| `/about` | About |
| `/settings` | Settings |
| `*` | NotFound |

## 5. Standard Page Data Loading
API-driven pages use:
```text
useState(data) + useState(isLoading) + useState(error)
                 ↓
          async loadData()
                 ↓
          try / catch / finally
                 ↓
useEffect(() => loadData(), [loadData])
                 ↓
       loading / error / data UI
```
Current API-driven pages:
- `Home.tsx` loads the mystery collection.
- `MysteryIntroPage.tsx` loads the selected mystery.
- `MysteryPage.tsx` loads the selected mystery and room list.
- `Result.tsx` revalidates the completed mystery.

## 6. Home Workflow
```text
Home mounts → useEffect → loadMysteries() → getMysteries()
→ GET /api/mysteries → controller → mysteries.js + gameState.js
→ public mystery list → setMysteries() → mystery cards render
```
The backend calculates `unlocked`. The frontend does not decide which mystery is unlocked.

## 7. Explore Workflow
```text
Home → /mystery/:id/explore → MysteryIntroPage
→ useEffect → loadMystery() → GET /api/mysteries/:id
→ Backend validates existence + unlock → public mystery response
→ Start Investigation → /mystery/:id
```
If the backend says the mystery is already completed, the intro page redirects to `/result/:id`.

## 8. MysteryPage Responsibilities
`MysteryPage` is the main frontend gameplay controller. It owns mystery data, room list, current question, loading/error state, answer state, feedback, current hint, remaining hints, and navigation.
```text
                 MysteryPage
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
RoomSidebar        RoomHero     Question area
                                      │
                                ┌─────┴─────┐
                                ↓           ↓
                          QuestionCard   HintCard
```

## 9. Component Communication
Data flows down from the Page through props:
```text
MysteryPage → RoomSidebar / RoomHero / QuestionCard / HintCard
```
User actions flow up through callback props:
```text
QuestionCard → onSubmit(answer) → MysteryPage
HintCard → onRequestHint() → MysteryPage
```
Presentational components do not call `fetch()` or own authoritative gameplay state.

## 10. RoomSidebar
Receives `rooms`, current room information, and progress. It displays room navigation and progress. Unlock status comes from the backend response.

## 11. RoomHero
Receives mystery ID, title, description, story, question number, and total questions. It displays the visual room, story, progress, and the exploration link.

## 12. QuestionCard
Receives question text, question number, total questions, `onSubmit`, `isSubmitting`, and feedback.
```text
User types answer → QuestionCard → onSubmit(answer)
                     ↓
              MysteryPage.submitAnswer()
                     ↓
                  api.ts
                     ↓
POST /api/mysteries/:id/questions/:questionId/answer
```
The component never receives the correct answer.

## 13. HintCard
Receives the current hint, hint count, maximum hints, loading state, and `onRequestHint`.
```text
User clicks Hint → HintCard → onRequestHint()
                              ↓
                    MysteryPage.requestCurrentHint()
                              ↓
                           api.ts
                              ↓
PATCH /api/mysteries/:id/questions/:questionId/hint
```
The actual hint text remains backend data until requested.

## 14. Answer Request — Backend Flow
```text
QuestionCard → MysteryPage.submitAnswer() → api.ts → POST
→ server.js → mystery.routes.js → submitAnswer()
→ validate body + IDs → find mystery + check unlock
→ find question + check completion → check currentQuestionId
→ checkAnswer() → update gameState → JSON response
```

## 15. Answer Validation
`validation.js` rejects missing, empty, whitespace-only, or non-string answers.
`answerChecker.js` uses trim + lowercase before comparison. `the server`, `The Server`, and ` THE SERVER ` are therefore equivalent.

## 16. Wrong Answer
Backend returns HTTP 200 with `correct: false`. The page stores the message in `feedback` and passes it to `QuestionCard`. `currentQuestionId` does not change, so the user can retry.

## 17. Correct Answer
If another question remains, the backend adds the current question to `solvedQuestionIds`, moves `currentQuestionId` to the next ordered question, and returns `nextQuestionId`.
The frontend then calls `getMysteryById(id)` again. This keeps the frontend synchronized with backend state instead of relying on stale local state.

## 18. Completing a Mystery
```text
Final correct answer → state.completed = true
                     → state.currentQuestionId = null
                     → finalReveal + nextMysteryId
                     → MysteryPage → /result/:id
                     → Result revalidates
                     → SuccessScreen displays final reveal
```

## 19. Hint Workflow
The backend checks that the mystery exists, is unlocked, is not completed, the requested question is current, and fewer than two hints have been used.
`MAX_HINTS = 2`.
```text
HintCard → MysteryPage → api.ts → PATCH hint
       → Backend reads hidden hint → increments hintsUsed
       → returns hint + hintsRemaining → MysteryPage updates state
       → HintCard renders the hint
```
A third hint request receives HTTP 400.

## 20. Mystery Unlocking
```text
Mystery 1 completed → Mystery 2 unlocked
Mystery 2 completed → Mystery 3 unlocked
```
The controller calculates unlock status from previous mystery runtime state. The frontend only displays the returned status.

## 21. Result Workflow
```text
/result/:id → Result mounts → useEffect → loadResult()
→ GET /api/mysteries/:id → Backend confirms completed
→ setFinalReveal() + setNextMysteryId() → SuccessScreen
```
The result page revalidates with the backend instead of trusting navigation state as the final authority.

## 22. Error Handling
`api.ts` converts failures to `ApiError`.
| Status | Meaning |
|---|---|
| 400 | Invalid input or invalid gameplay action |
| 403 | Mystery locked |
| 404 | Mystery/question/API endpoint not found |
| 500 | Server error |
| Network | Server unavailable |
```text
Backend error → api.ts → ApiError → Page catch → error state → user-facing alert
```

## 23. Backend Data Model
Static data: `server/src/data/mysteries.js` contains titles, descriptions, stories, questions, correct answers, hints, final reveals, and next mystery IDs.
Runtime state: `server/src/data/gameState.js` contains current question, solved question IDs, hints used, and completion state.
Server restart resets runtime state.

## 24. Public Data Boundary
Public question data: `id`, `order`, `text`, `maxHints`.
Never exposed as public question data: `answer`, `hints`.
Final reveal and next mystery data are exposed only after completion. `toPublicQuestion()` and `toPublicMystery()` enforce this boundary.

## 25. Complete Gameplay Workflow
```text
Home → GET mysteries → Explore mystery → GET mystery
→ Start investigation → MysteryPage
→ QuestionCard ←→ MysteryPage ←→ HintCard
→ POST answer / PATCH hint
→ Backend validates + updates gameState
→ Wrong = retry / Correct = next question
→ Final correct = Result → Final reveal → Next mystery or Home
```

## 26. Responsibility Matrix
| Responsibility | Frontend | Backend |
|---|---:|---:|
| Render UI | ✓ | |
| Collect input | ✓ | |
| Loading/error UI | ✓ | |
| Route navigation | ✓ | |
| HTTP through API service | ✓ | |
| Store correct answers | | ✓ |
| Store hidden hints | | ✓ |
| Check answers | | ✓ |
| Enforce question order | | ✓ |
| Track hint usage | | ✓ |
| Determine unlock state | | ✓ |
| Determine completion | | ✓ |
| Return final reveal | | ✓ |
| Prevent gameplay bypass | | ✓ |

## 27. Development Rule for New Features
1. Define the backend rule/state.
2. Update controller and route if necessary.
3. Define the API response.
4. Update `mystery.types.ts`.
5. Add/update the function in `services/api.ts`.
6. Let the responsible Page call the API.
7. Store returned data in Page state.
8. Pass only required data to child components.
9. Let children report actions through callbacks.
10. Keep hidden game data on the backend.
11. Update `docs/API.md` for contract changes.
12. Update `docs/PROJECT-STRUCTURE.md` for architecture changes.

## 28. Golden Rule
```text
Backend = truth
Page = data flow
Component = presentation + user interaction
api.ts = communication boundary
Router = navigation
```

Related documents: `docs/API.md`, `docs/PROJECT-STRUCTURE.md`, and `README.md`.