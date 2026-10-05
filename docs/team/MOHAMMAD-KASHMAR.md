# Team Contribution Documentation — Mohammad Kashmar

## 1. Member Information

- **Name:** Mohammad Kashmar
- **Role:** Team 1 Member
- **GitHub account:** `Mohammad-Kashmar135`

The team-division document lists Mohammad Kashmar as a member of Team 1.

## 2. Main Responsibility

Mohammad's documented repository contribution is in the **backend API routing layer**.

His recorded commit added the Express mystery router and mounted it in the server application.

## 3. API Router

The contribution introduced:

```text
server/src/routes/mystery.routes.js
```

The router connects the HTTP API endpoints to the corresponding mystery controllers.

The implemented routes are:

```http
GET   /api/mysteries
GET   /api/mysteries/:id
POST  /api/mysteries/:id/questions/:questionId/answer
PATCH /api/mysteries/:id/questions/:questionId/hint
```

The router imports these controller functions:

- `getMysteries`
- `getMysteryById`
- `submitAnswer`
- `requestHint`

This keeps HTTP route definitions separate from controller logic.

## 4. Mounting the Router

Mohammad also connected the router to the Express application in:

```text
server/src/server.js
```

The router is mounted under:

```text
/api/mysteries
```

This creates a clean separation:

```text
HTTP request
    ↓
/api/mysteries
    ↓
mystery.routes.js
    ↓
mystery.controller.js
    ↓
data / validation / game state
```

## 5. Why This Layer Matters

The route layer provides the API entry points used by the React frontend.

It does not contain the gameplay rules itself. Instead, it delegates each request to a controller.

This makes the backend easier to understand because:

- Routes define **which URL and HTTP method are supported**.
- Controllers define **what happens when the route is called**.
- Data modules contain **mystery content and runtime state**.
- Utility modules contain **validation and answer-checking logic**.

## 6. Contribution Impact

The routing work established the HTTP boundary between the frontend and backend.

Without this layer, the frontend would not have stable API endpoints for:

- Loading the mystery list.
- Loading one mystery.
- Submitting an answer.
- Requesting a hint.

## 7. Contribution Summary

| Area | Contribution |
| --- | --- |
| Backend | Express API routing |
| File | `server/src/routes/mystery.routes.js` |
| Integration | Mounted mystery router in `server/src/server.js` |
| Endpoints | GET mysteries, GET mystery, POST answer, PATCH hint |
| Architecture | Separated routes from controllers |

## 8. Evidence in Repository History

The repository history records the contribution with the commit message:

```text
add mystery routes and mount router in server
```

The commit added `server/src/routes/mystery.routes.js` and modified `server/src/server.js`.
