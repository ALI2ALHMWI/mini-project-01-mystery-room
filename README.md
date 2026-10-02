# Mini Project 01 — Mystery Room

A browser-based interactive mystery experience built with React, TypeScript, Node.js, and Express.

The player enters a mystery, reads the story, investigates clues, answers questions, uses hints when needed, and progresses through the mystery until reaching the final reveal.

---

# 1. Project Goal

The goal of the project is to build a complete interactive mystery experience rather than a traditional CRUD or administration application.

The application demonstrates:

* React frontend development
* TypeScript
* React Router
* React Hooks
* Context API
* REST API communication
* Express routing
* Controllers
* Backend validation
* In-memory runtime state
* Frontend/backend integration
* Error handling
* Responsive UI
* Git collaboration

---

# 2. User Experience

The main gameplay flow is:

```text
Home
  ↓
Start Mystery
  ↓
Read Story
  ↓
Inspect Clues
  ↓
Answer Question
  ↓
Correct?
 ├── No → Retry
 │
 └── Yes
      ↓
   Next Question
      ↓
   Mystery Complete
      ↓
   Final Reveal
      ↓
   Next Mystery
      ↓
   Final Completion
```

Questions must be solved in order.

Each question has exactly one answer.

Answers are case-insensitive.

Each question allows a maximum of two hints.

---

# 3. Technology Stack

## Frontend

* React
* TypeScript
* React Router
* React Hooks
* `useState`
* `useEffect`
* Context API
* CSS

## Backend

* Node.js
* Express
* JavaScript
* ES Modules

## Development

* Git
* Git branches
* Pull Requests

---

# 4. State Management

The project intentionally uses simple state management.

## Local React State

`useState` is used for local UI state such as:

* answer input
* loading state
* UI errors
* temporary feedback
* hint display state

## Context API

Context is used only for genuinely shared application state.

Currently the project uses:

```text
NotificationContext
```

It is responsible for displaying notifications such as:

```text
Correct answer!
```

## Redux

Redux is **not used**.

The project does not contain a Redux store or slices.

This keeps the architecture simple and avoids introducing global state where local state is sufficient.

## Backend State

The backend is the source of truth for the actual mystery progression.

The backend controls:

* current question
* solved questions
* correct answers
* hint usage
* mystery completion
* final reveal
* next mystery progression

---

# 5. Project Structure

```text
Mini-Project-01/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── mystery/
│   │   │   ├── question/
│   │   │   └── hint/
│   │   │
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── HowToPlay/
│   │   │   ├── Mystery/
│   │   │   └── Result/
│   │   │
│   │   ├── routes/
│   │   │   └── AppRouter.tsx
│   │   │
│   │   ├── context/
│   │   │   └── NotificationContext.tsx
│   │   │
│   │   ├── hooks/
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   ├── types/
│   │   │   └── mystery.types.ts
│   │   │
│   │   ├── styles/
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── mystery.controller.js
│   │   │
│   │   ├── routes/
│   │   │   └── mystery.routes.js
│   │   │
│   │   ├── data/
│   │   │   ├── mysteries.js
│   │   │   └── gameState.js
│   │   │
│   │   ├── utils/
│   │   │   ├── validation.js
│   │   │   └── answerChecker.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
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

For a detailed explanation of the architecture, see:

```text
docs/PROJECT-STRUCTURE.md
```

---

# 6. Frontend Routes

The application contains at least three meaningful routes and a dynamic mystery route.

| Route          | Purpose           |
| -------------- | ----------------- |
| `/`            | Home              |
| `/how-to-play` | Game instructions |
| `/mystery/:id` | Mystery gameplay  |
| `/result/:id`  | Completion/result |

The mystery route uses the mystery ID from the URL.

Example:

```text
/mystery/mystery-1
```

---

# 7. API

The frontend communicates with the backend through a single API helper:

```text
client/src/services/api.ts
```

UI components should not make direct HTTP requests.

## Endpoints

### Get mysteries

```http
GET /api/mysteries
```

### Get a mystery

```http
GET /api/mysteries/:id
```

### Submit an answer

```http
POST /api/mysteries/:id/questions/:questionId/answer
```

Request:

```json
{
  "answer": "shadow"
}
```

### Request a hint

```http
PATCH /api/mysteries/:id/questions/:questionId/hint
```

For the complete API contract, see:

```text
docs/API.md
```

---

# 8. Game Rules

## Answers

Each question has exactly one correct answer.

Answers are case-insensitive.

For example:

```text
shadow
Shadow
SHADOW
sHaDoW
```

are treated as the same answer.

---

## Wrong Answers

A wrong answer does not advance the game.

The player remains on the same question and can try again.

---

## Question Order

Questions must be solved in order.

The player cannot skip a question.

The backend validates the current question before accepting an answer.

---

## Hints

Each question has a maximum of two hints.

The frontend does not contain the actual hint text.

Hints are requested from the backend.

After two hints have been used, another hint request is rejected.

---

## Completion

When the final question is answered correctly:

1. the mystery becomes completed
2. the final reveal is returned
3. the next mystery can become available when one exists
4. the player can continue to the next mystery

When there are no more mysteries, the player reaches the final completion screen.

---

# 9. Information Security Within the Game

The frontend must not receive hidden solution information before it is needed.

The mystery GET endpoint does not expose:

* correct answers
* actual hint text
* final reveal

The actual hint is returned only when the player requests a hint.

The final reveal is returned only after the final answer has been correctly submitted.

This keeps the backend as the source of truth for the mystery.

---

# 10. Backend Architecture

The backend follows a simple structure:

```text
Express Router
      ↓
Controller
      ↓
Validation / Answer Checker
      ↓
Static Mystery Data
      +
Runtime Game State
```

## Static Data

Stored in:

```text
server/src/data/mysteries.js
```

Contains the mystery content and correct answers.

## Runtime State

Stored in:

```text
server/src/data/gameState.js
```

Contains temporary in-memory gameplay state.

No database is used.

---

# 11. Error Handling

The API uses appropriate HTTP status codes.

## `200`

Used for successful requests and valid gameplay results.

A wrong answer is a valid gameplay result and can therefore return:

```text
200
```

with:

```json
{
  "correct": false
}
```

## `400`

Used for invalid requests or invalid gameplay actions.

Examples:

* missing answer
* answer is not a string
* empty answer
* attempting to use a third hint
* attempting an invalid gameplay action

## `404`

Used when the requested resource does not exist.

Examples:

* mystery not found
* question not found

The frontend must display useful error feedback instead of leaving the user with a blank screen.

---

# 12. Running the Project

The project contains two applications:

```text
client/
server/
```

Both must be installed and run separately.

---

## Backend

Open a terminal:

```bash
cd server
npm install
npm run dev
```

The backend uses Node.js with Express.

The exact development port is defined by the server configuration.

---

## Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend development server will provide the local application URL.

---

# 13. Development Rules

All frontend API calls must go through:

```text
client/src/services/api.ts
```

Do not place API calls directly inside UI components.

The frontend should not contain the actual answers or hidden hint text.

The backend should remain the source of truth for gameplay progression.

Do not add unnecessary architecture or libraries.

---

# 14. Forbidden Technologies

The project intentionally does not use:

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

The goal is to demonstrate the required React and Express concepts without unnecessary complexity.

---

# 15. Git Workflow

Each team member works on a separate feature branch.

Before starting work:

```bash
git checkout main
git pull origin main
```

Create a branch:

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

After completing work:

```bash
git status
git add .
git commit -m "feat: describe the change"
git push -u origin feature/your-task-name
```

Then create a Pull Request.

Do not push directly to `main`.

---

# 16. Team

| Member           | Responsibility                                |
| ---------------- | --------------------------------------------- |
| Ali Al Hamwi     | Question & Hint UI + Notifications            |
| Yousef Yousef    | Mystery Gameplay + API Service + Types        |
| Nagham Jaza      | Routing + Pages + Application Structure       |
| Nawar Hasan      | Validation + Answer Checking                  |
| Laith Haj Hosin  | Mystery Controller + Game State + Progression |
| Mohammad Kashmar | API Routes + Endpoint Testing                 |

Each member owns a specific implementation area, but every member is expected to understand the complete project.

---

# 17. Content

The current mystery data can be mock data during development.

Before the final submission, the team must create the final original:

* mystery theme
* story
* characters if needed
* questions
* clues
* answers
* hints
* final reveal
* visual identity

The final experience should feel like one coherent mystery rather than unrelated questions.

---

# 18. Final Testing

Before submission, the team must verify the complete flow:

```text
Home
 ↓
Start Mystery
 ↓
Load Mystery
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
Next Question
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
* missing answer
* invalid answer type
* empty answer
* wrong answer
* correct answer
* first hint
* second hint
* third hint
* server/API error
* page refresh
* responsive layout

---

# 19. Definition of Done

The project is ready when:

### Frontend

* React + TypeScript are used.
* React Router is implemented.
* At least three meaningful routes exist.
* A dynamic mystery route exists.
* Mystery data comes from the backend.
* API calls use the API helper.
* Loading states exist.
* Error states exist.
* Answer input works.
* Hints work.
* Notifications work.
* Result/completion screen works.
* The interface is responsive.

### Backend

* Node.js + Express are used.
* Express Router is used.
* Controllers are implemented.
* Runtime state is stored in memory.
* Mystery collection endpoint works.
* Mystery detail endpoint works.
* Answer endpoint works.
* Hint endpoint works.
* Validation works.
* 400 responses work.
* 404 responses work.
* Endpoints are tested independently.

### Gameplay

* One answer per question.
* Answers are case-insensitive.
* Questions must be solved in order.
* Wrong answers allow retry.
* Maximum two hints per question.
* Correct answers advance the game.
* Mystery completion works.
* Final reveal works.
* Next mystery progression works.

### Project Quality

* Original story and clues.
* Intentional visual identity.
* Responsive design.
* Clean project structure.
* No forbidden technologies.
* Meaningful Git history.
* README documentation.
* Full end-to-end testing.
* All team members understand the whole project.
* All team members can participate in the English presentation.

---

# 20. Documentation

Additional project documentation:

```text
docs/PROJECT-STRUCTURE.md
```

Detailed architecture and file responsibilities.

```text
docs/API.md
```

Detailed API contract and endpoint behavior.

```text
docs/TASKS.md
```

Team responsibilities, ownership, workflow, and Definition of Done.
