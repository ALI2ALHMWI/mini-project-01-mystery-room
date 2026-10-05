# Team Contribution Documentation — Ali Al Hamwi

## 1. Member Information

- **Name:** Ali Al Hamwi
- **Role:** Team 1 Leader
- **Repository:** `ALI2ALHMWI/mini-project-01-mystery-room`
- **GitHub account:** `ALI2ALHMWI`

The team-division document identifies Ali Al Hamwi as the leader of Team 1. The project history also shows Ali as the author of the main integration and review pull requests used to bring the different parts of the project together.

## 2. Main Responsibility

Ali's contribution is best described as **project leadership, frontend/backend integration, gameplay integration, review fixes, and final project coordination** rather than one isolated page.

The repository history shows Ali coordinating and implementing several cross-cutting changes after the initial frontend/backend pieces were created by team members. These changes connected the game flow, backend state, frontend state, routing, error handling, responsive behavior, and final documentation.

## 3. Frontend Integration Work

Ali worked on and integrated several frontend areas, including:

- Mystery gameplay page behavior.
- Result-page navigation and completion flow.
- Mystery exploration flow.
- Route integration.
- Responsive navigation fixes.
- Mystery sidebar synchronization with backend unlock state.
- Not Found page integration.
- Settings navigation cleanup.
- Removal of obsolete Login UI and Redux dependencies.

The final application uses routes such as `/`, `/how-to-play`, `/mystery/:id/explore`, `/mystery/:id`, `/result/:id`, `/about`, `/settings`, and a catch-all Not Found route.

## 4. Gameplay Integration

A major part of Ali's work was making the frontend follow the backend as the source of truth.

The integration work ensures that:

1. A mystery is loaded from the API.
2. The current question comes from backend game state.
3. Answers are submitted through the API.
4. Correct answers advance the game.
5. Completing the final question navigates to the result page.
6. The next mystery becomes available according to backend state.
7. Refreshing or directly opening a result page does not depend only on temporary navigation state.
8. Locked mysteries are represented using backend-controlled state.

This is important because the frontend should not be able to invent its own gameplay progression.

## 5. Error Handling and Integration Fixes

Ali also worked on integration-level error handling and review fixes.

The final architecture handles:

- `400` invalid gameplay/input errors.
- `403` locked mysteries.
- `404` missing mysteries/questions/routes.
- `500` unexpected server errors.
- Network failures.
- Invalid or incomplete result data.
- Stale gameplay state when changing mystery IDs.

The goal was to avoid blank screens and make failures recoverable and understandable to the user.

## 6. Mystery Exploration Feature

Ali's project history includes the dedicated mystery exploration feature.

The feature introduced a separate `/mystery/:id/explore` stage before gameplay. This page presents the mystery introduction and story before the player starts the investigation.

The work included:

- Creating the exploration route.
- Connecting the Home/mystery flow to the exploration page.
- Using client-side navigation.
- Providing loading and error states.
- Keeping gameplay on `/mystery/:id`.
- Avoiding exposure of answers and unrevealed hints.

## 7. React Hooks and Data Loading Architecture

Ali also contributed to the refactoring that standardized API-driven page loading.

The project uses the following pattern:

```text
useState
   ↓
explicit load...() function
   ↓
try / catch / finally
   ↓
useEffect()
   ↓
loading / error / data UI
```

The explicit loader functions are stabilized with `useCallback` where they are dependencies of `useEffect`.

This approach was chosen instead of Redux because the relevant state is either local UI state or backend-owned gameplay state. A global Redux store would add complexity without providing a necessary source of truth for this project.

## 8. Redux Cleanup

The repository history shows a dedicated cleanup that removed legacy Redux and React-Redux dependencies.

The cleanup included:

- Removing unused Redux dependencies.
- Removing obsolete Login UI.
- Removing obsolete Login styles.
- Adding Settings to the main navigation.

The resulting architecture intentionally keeps state management simple and uses React state plus Context only where appropriate.

## 9. Review and Quality Improvements

Ali's later work included review-driven fixes such as:

- Removing unused component props.
- Removing an unused FailureScreen component.
- Fixing mobile navigation.
- Making the mystery sidebar backend-driven.
- Removing stale mystery mappings.
- Fixing result navigation.
- Simplifying server startup configuration.
- Standardizing page loading patterns.
- Updating the project documentation.

These changes are integration/quality work because they improve consistency between independently developed parts of the application.

## 10. Documentation and Final Project Coordination

Ali also contributed to the final project documentation and project-level architecture explanation.

The documentation explains:

- Frontend/backend responsibilities.
- API contracts.
- Controllers.
- Runtime game state.
- State management decisions.
- React Hook usage.
- Error handling.
- Information exposure rules.
- Development workflow.
- QA expectations.

## 11. Contribution Summary

| Area | Contribution |
| --- | --- |
| Leadership | Team 1 leader and project coordination |
| Integration | Connected frontend, backend, routes, and gameplay state |
| Frontend | Gameplay, exploration, result flow, navigation, responsive fixes |
| Backend integration | Backend-authoritative gameplay behavior |
| State management | Standardized page loading and React Hook patterns |
| Architecture | Helped keep Redux and unnecessary global state out of the final design |
| QA/review | Multiple review and integration fixes |
| Documentation | Project architecture and development documentation |

## 12. Key Takeaway

Ali's contribution was primarily the **integration and completion layer** of the project. The work connected the individual frontend/backend contributions into one coherent Mystery Room application and addressed the cross-cutting concerns required for a stable final submission.
