# Team Contribution Documentation — Laith Haj Hosin

## 1. Member Information

- **Name:** Laith Haj Hosin
- **Role:** Team 1 Member
- **GitHub branch:** `laith`

The team-division document lists Laith Haj Hosin as a member of Team 1.

## 2. Main Responsibility

Laith's documented contribution focused on **backend gameplay-state handling, information exposure, mystery IDs, API documentation, and final integration testing**.

His contribution is especially important to the backend-authoritative design of the game.

## 3. Backend Game-State Exposure

Laith updated:

```text
server/src/controllers/mystery.controller.js
```

The controller was changed so a public mystery response can expose safe runtime state without exposing secret gameplay information.

The public response includes:

- `currentQuestionId`
- `completed`
- `hintsUsed`

The implementation copies the `hintsUsed` object rather than exposing the live runtime object directly.

## 4. Protecting Hidden Information

The contribution reinforced an important security rule of the game: the frontend may know the current gameplay state, but it must not receive hidden answers or unrevealed hint text.

The controller only adds:

```text
finalReveal
nextMysteryId
```

after the mystery has been completed.

This preserves the information boundary:

```text
Public mystery data
        +
Safe runtime state
        ↓
Frontend

Correct answers / unrevealed hints
        ↓
Backend only
```

## 5. Refresh-Safe Gameplay State

The backend state fields allow the frontend to reconstruct the active game after a page refresh.

Instead of assuming that the player always starts from question one, the frontend can use:

```text
currentQuestionId
hintsUsed
completed
```

to restore the current gameplay position.

This supports the project's backend-as-source-of-truth architecture.

## 6. Answer and Hint Flow

The controller continues to validate gameplay before changing state.

For answer submission it checks:

1. The answer request is valid.
2. The mystery exists.
3. The question exists.
4. The mystery is not already completed.
5. The submitted question is the current question.
6. The answer is checked against the correct answer.
7. Runtime state is updated only after a correct answer.
8. The next question is selected when available.
9. The mystery is marked completed after the final question.

For hints it checks:

1. The mystery exists.
2. The question exists.
3. The mystery is not completed.
4. The requested question is the current question.
5. The hint limit has not been reached.
6. The next hint is returned and usage is incremented.

## 7. Mystery IDs

Laith also updated the mystery progression identifiers so the three current mysteries link consistently:

```text
mystery-1 → mystery-2 → mystery-3
```

This removed the older inconsistent next-mystery identifiers.

## 8. API Documentation

Laith updated:

```text
docs/API.md
```

The documentation was adjusted to explain that `GET /api/mysteries/:id` can return the current game state while still keeping secret answer/reveal information protected.

## 9. Testing and Final Integration

The recorded commit message also states that the final project was tested.

The contribution therefore combined implementation with integration verification around:

- Mystery IDs.
- Game-state exposure.
- API behavior.
- Final gameplay state.

## 10. Contribution Summary

| Area | Contribution |
| --- | --- |
| Backend | Runtime game-state exposure and progression logic refinement |
| Security boundary | Prevented hidden answers/hints from being exposed early |
| State | Added safe `currentQuestionId`, `completed`, and `hintsUsed` exposure |
| Mystery data | Fixed next-mystery IDs |
| Documentation | Updated `docs/API.md` |
| QA | Tested the final project according to the commit description |

## 11. Key Takeaway

Laith's contribution strengthened the **backend-authoritative gameplay model**. The frontend can recover safe game state, while secret answers and unrevealed hints remain protected on the server.
