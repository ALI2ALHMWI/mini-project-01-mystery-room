# Team Contribution Documentation — Nawar Hasan

## 1. Member Information

- **Name:** Nawar Hasan
- **Role:** Team 1 Member
- **Repository identity found in history:** `Nawar`

The team-division document lists Nawar Hasan as a member of Team 1.

## 2. Main Responsibility

Nawar's documented contribution is focused on the **answer-checking utility** used by the backend gameplay logic.

## 3. Answer Normalization

Nawar added:

```text
server/src/utils/answerChecker.js
```

The utility contains two functions:

```js
normalizeAnswer(answer)
checkAnswer(userAnswer, correctAnswer)
```

## 4. `normalizeAnswer`

The normalization function trims surrounding whitespace and converts the answer to lowercase.

Conceptually:

```text
"  Shadow  "
      ↓
"shadow"
```

This means accidental spaces and capitalization do not cause an otherwise correct answer to fail.

## 5. `checkAnswer`

The checker normalizes both values before comparing them:

```text
user answer
    ↓
normalize
    ↓
compare
    ↑
normalize
    ↑
correct answer
```

The result is a boolean indicating whether the submitted answer matches the expected answer.

## 6. Why This Utility Is Separate

Keeping answer comparison in its own utility avoids duplicating normalization logic inside the controller.

The controller can focus on gameplay rules:

- Is the mystery valid?
- Is the question valid?
- Is this the current question?
- Is the mystery already completed?
- What happens after a correct answer?

The answer checker focuses on one small responsibility:

```text
Does this normalized user answer match the normalized correct answer?
```

## 7. Gameplay Impact

The utility supports the project requirement that answers are case-insensitive and tolerant of surrounding whitespace.

For example, values such as:

```text
shadow
Shadow
SHADOW
  shadow  
```

are normalized before comparison.

## 8. Contribution Summary

| Area | Contribution |
| --- | --- |
| Backend | Answer validation utility |
| File | `server/src/utils/answerChecker.js` |
| Function | `normalizeAnswer()` |
| Function | `checkAnswer()` |
| Gameplay rule | Case-insensitive comparison with surrounding whitespace ignored |
| Architecture | Isolated answer comparison from controller logic |

## 9. Evidence in Repository History

The repository records the contribution in a commit titled:

```text
check answer
```

The commit adds `server/src/utils/answerChecker.js` with the normalization and comparison functions.

## 10. Key Takeaway

Nawar's contribution provided the **small, reusable answer-checking layer** that makes free-text mystery answers predictable and user-friendly while keeping the controller focused on gameplay progression.
