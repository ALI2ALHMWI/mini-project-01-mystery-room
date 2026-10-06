# Services and API Reference

## Purpose

The frontend service layer is the communication boundary between React pages/components and the backend API.

Main file:

`client/src/services/api.ts`

Its responsibilities are:

- building API URLs;
- sending HTTP requests;
- converting backend failures into a consistent `ApiError`;
- typing API responses;
- exposing small functions that pages can call without knowing the HTTP implementation.

Architecture:

```text
React Page
   ↓
services/api.ts
   ↓
fetch()
   ↓
Express Route
   ↓
Controller
   ↓
JSON Response
   ↓
services/api.ts
   ↓
Typed data / ApiError
   ↓
React Page
```

## Configuration

### `API_BASE_URL`

The service reads:

`VITE_API_BASE_URL`

If it is not defined, it falls back to:

`/api`

The trailing slash is removed so paths can be appended consistently.

Example:

```text
/api + /mysteries
→ /api/mysteries
```

## Error Constants

### `NETWORK_ERROR_MESSAGE`

Used when `fetch()` cannot reach the server.

The user sees:

`The server is unavailable. Please check your connection and try again.`

### `STATUS_MESSAGES`

Provides consistent frontend messages for common HTTP statuses:

| Status | Meaning |
|---|---|
| 400 | Invalid input or gameplay action |
| 403 | Mystery is locked |
| 404 | Mystery or question not found |
| 500 | Server error |

This prevents each page from implementing its own HTTP status handling.

## `ApiError`

Custom error class used by the service layer.

It contains:

- `message` — user-facing error message;
- `status` — HTTP status or `null` for network failures.

Pages can therefore use:

```ts
if (error instanceof ApiError) {
  // handle API error
}
```

## `isApiErrorResponse(value)`

Checks whether a received JSON value contains a string `message` property.

This is used when the server returns an error body such as:

```json
{
  "message": "Mystery not found."
}
```

## `getHttpErrorMessage(status, data)`

Converts an HTTP response into a consistent message.

Workflow:

1. Check whether the status has a predefined message.
2. If not, check whether the server returned a valid API error object.
3. Otherwise generate a generic status message.

This keeps error presentation centralized.

## `request<T>(path, options?)`

This is the core function of the service.

All public API functions use it.

### Workflow

```text
request()
  ↓
fetch(API_BASE_URL + path)
  ↓
Network error?
  ├─ Yes → throw ApiError(network message)
  └─ No
       ↓
Parse JSON
       ↓
JSON parsing fails?
  ├─ Error response → throw ApiError(status message)
  ├─ Successful response → throw invalid response ApiError
  └─ Continue
       ↓
response.ok?
  ├─ No → throw ApiError
  └─ Yes → return typed data
```

The generic type `T` allows each API function to specify the expected response type.

---

# Public API Functions

## 1. `getMysteries()`

### HTTP

`GET /api/mysteries`

### Return type

`Promise<MysteryListItem[]>`

### Purpose

Loads the mystery collection for the Home page and room navigation.

### Workflow

```text
Home / MysteryPage
  ↓
getMysteries()
  ↓
request<MysteryListItem[]>('/mysteries')
  ↓
GET /api/mysteries
  ↓
Mystery controller
  ↓
Mystery list
```

The returned data includes only public mystery information and `unlocked`.

---

## 2. `getMysteryById(id)`

### HTTP

`GET /api/mysteries/:id`

### Return type

`Promise<Mystery>`

### Purpose

Loads one mystery and its current backend state.

The ID is passed through `encodeURIComponent()` before being inserted into the URL.

Used by:

- Mystery Intro page;
- Mystery gameplay page;
- Result page.

### Important

The returned object contains the current question and hint usage, but does not expose question answers or hidden hint text.

---

## 3. `submitAnswer(mysteryId, questionId, answer)`

### HTTP

`POST /api/mysteries/:id/questions/:questionId/answer`

### Return type

`Promise<AnswerResponse>`

### Request body

```json
{
  "answer": "player answer"
}
```

### Workflow

```text
QuestionCard
  ↓
MysteryPage.submitAnswer()
  ↓
services.submitAnswer()
  ↓
POST request
  ↓
Backend submitAnswer()
  ↓
AnswerResponse
  ↓
MysteryPage updates UI / navigates
```

The service does not decide whether the answer is correct. The backend does that.

---

## 4. `requestHint(mysteryId, questionId)`

### HTTP

`PATCH /api/mysteries/:id/questions/:questionId/hint`

### Return type

`Promise<HintResponse>`

### Purpose

Requests exactly the next available hint for the current question.

The service sends no hint content from the frontend. The backend decides which hint is returned.

### Workflow

```text
HintCard
  ↓
MysteryPage.requestCurrentHint()
  ↓
services.requestHint()
  ↓
PATCH request
  ↓
Backend validates hint availability
  ↓
HintResponse
  ↓
HintCard displays returned hint
```

## Service Layer Rules

### Rule 1 — Pages call services, not `fetch()`

A page should call:

```ts
getMysteryById(id)
```

instead of directly writing:

```ts
fetch("/api/mysteries/" + id)
```

### Rule 2 — Services do not contain UI logic

The service should not:

- navigate;
- render messages;
- update React state;
- decide what component should display.

It only communicates with the API and returns data/errors.

### Rule 3 — Backend remains authoritative

The service does not calculate:

- unlocked mysteries;
- correct answers;
- next questions;
- hint limits;
- completion.

Those decisions belong to the backend.

## Complete Request Flow

```text
User action
  ↓
React page/component
  ↓
api.ts function
  ↓
request<T>()
  ↓
fetch()
  ↓
Express route
  ↓
Controller
  ↓
JSON response
  ↓
request<T>()
  ↓
Typed data OR ApiError
  ↓
React state update
  ↓
UI
```
