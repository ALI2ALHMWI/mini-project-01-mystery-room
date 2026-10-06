# Notifications Reference

## Current Implementation

The project does not currently have a separate notification service.

Notifications are implemented through:

`client/src/context/NotificationContext.tsx`

The implementation uses:

- React Context;
- `useState`;
- `useEffect`;
- a small notification object;
- automatic dismissal after 3 seconds.

This document describes the implementation that currently exists in GitHub.

## Architecture

```text
main.tsx
  ↓
NotificationProvider
  ↓
App
  ↓
Any component/page inside Provider
  ↓
useNotification()
  ↓
showNotification() / hideNotification()
  ↓
NotificationContext state
  ↓
Notification UI
```

## 1. `NotificationType`

The project supports three notification types:

```ts
export type NotificationType = "success" | "error" | "info";
```

These types are used to distinguish the notification's semantic purpose and CSS class.

The rendered class follows:

`notification notification--{type}`

For example:

```text
notification--success
notification--error
notification--info
```

## 2. Notification Interface

The internal notification object contains:

```ts
interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}
```

### Fields

- `id` — generated using `Date.now()`.
- `type` — success, error, or info.
- `message` — text displayed to the user.

The ID is useful for identifying a notification instance when state changes.

## 3. `NotificationContextValue`

The context exposes two functions:

```ts
interface NotificationContextValue {
  showNotification: (
    type: NotificationType,
    message: string
  ) => void;

  hideNotification: () => void;
}
```

The context intentionally exposes actions rather than the internal state object.

---

# `NotificationProvider`

## Purpose

`NotificationProvider` owns notification state and renders the notification UI.

It is mounted globally in `client/src/main.tsx`.

Current structure:

```tsx
<NotificationProvider>
  <App />
</NotificationProvider>
```

This means all application pages/components rendered inside `App` can access notifications.

## Internal State

```ts
const [notification, setNotification] =
  useState<Notification | null>(null);
```

There can be either:

- no active notification → `null`;
- one active notification → notification object.

The current implementation displays one notification at a time.

---

## 4. `showNotification(type, message)`

### Purpose

Creates and displays a notification.

### Workflow

```text
Component
  ↓
showNotification("success", "Correct answer.")
  ↓
setNotification()
  ↓
Notification state exists
  ↓
Provider renders notification
  ↓
3-second timer starts
```

Example from the gameplay page:

```ts
showNotification("success", result.message);
```

This is called after a correct answer is received from the backend.

### Important

The notification function does not validate the gameplay result.

The backend determines whether the answer is correct; the page then decides whether a success notification should be displayed.

---

## 5. `hideNotification()`

### Purpose

Immediately removes the active notification.

Workflow:

```text
User clicks ×
  ↓
hideNotification()
  ↓
setNotification(null)
  ↓
Notification disappears
```

It is also part of the context API so other components could dismiss a notification programmatically.

---

## 6. Automatic Dismissal with `useEffect`

The provider watches the notification state:

```ts
useEffect(() => {
  if (!notification) {
    return;
  }

  const timer = window.setTimeout(() => {
    setNotification(null);
  }, 3000);

  return () => {
    window.clearTimeout(timer);
  };
}, [notification]);
```

### Workflow

```text
Notification appears
  ↓
useEffect runs
  ↓
3-second timer starts
  ↓
Timer completes
  ↓
setNotification(null)
  ↓
Notification disappears
```

### Cleanup

If a new notification replaces the old one before the timer finishes, the previous timer is cleared.

This prevents old timers from unexpectedly removing a newer notification.

---

# Notification Rendering

When a notification exists, the provider renders:

- a container with the notification type in its class;
- the message;
- a close button.

The notification uses:

`role="alert"`

This allows assistive technologies to treat it as an important status/message.

The close button uses:

`aria-label="Close notification"`

for accessibility.

---

# `useNotification()`

## Purpose

Provides notification actions to any component inside `NotificationProvider`.

Usage:

```ts
const { showNotification } = useNotification();
```

Then:

```ts
showNotification("success", "Correct answer.");
```

## Safety Check

If `useNotification()` is called outside the provider, it throws:

```text
useNotification must be used inside NotificationProvider
```

This makes an incorrect component hierarchy fail clearly instead of silently doing nothing.

---

# Current Gameplay Notification Workflow

In `MysteryPage.tsx`:

```text
Player submits answer
  ↓
submitAnswer()
  ↓
api.submitAnswer()
  ↓
Backend checks answer
  ↓
Correct?
  ├─ No
  │   ↓
  │  Feedback shown in question UI
  │
  └─ Yes
      ↓
      showNotification("success", result.message)
      ↓
      If mystery completed
        → navigate to Result
      Else
        → reload current backend state
        → display next question
```

The notification is therefore a UI feedback mechanism, not the source of gameplay state.

## Error Handling vs Notifications

The current project uses two related but different mechanisms:

### Page error state

Used for errors that affect page data or gameplay actions.

Examples:

- server unavailable;
- mystery not found;
- mystery locked;
- invalid request.

These are stored in page state such as:

```ts
loadError
actionError
error
```

and displayed as page-level error messages.

### Notification

Used for short-lived feedback.

Current gameplay example:

```ts
showNotification("success", result.message);
```

This distinction is useful:

```text
Important persistent error
→ Page error state

Short-lived feedback
→ NotificationContext
```

## Current Limitation

The current notification system supports one active notification at a time.

It does not currently implement:

- notification queues;
- multiple simultaneous notifications;
- a dedicated notification service;
- persistence;
- backend-driven notifications.

Those features should not be assumed to exist unless they are added explicitly.

## Recommended Usage Rule

Components should not directly manipulate the notification state.

Use:

```ts
useNotification()
```

and call:

```ts
showNotification(type, message)
```

or:

```ts
hideNotification()
```

The provider remains responsible for rendering, timing, and cleanup.
