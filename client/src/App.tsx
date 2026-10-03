import { useState } from "react";
import "./styles/global.css";
import QuestionCard from "./components/question/QuestionCard";
import HintCard from "./components/hint/HintCard";

function App() {
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const [hintsUsed, setHintsUsed] = useState(0);

  const [hint, setHint] = useState<string | undefined>();

  const [isHintLoading, setIsHintLoading] = useState(false);

  const handleSubmit = (answer: string) => {
    if (answer.toLowerCase() === "shadow") {
      setFeedback({
        type: "success",
        message: "Correct! You solved the clue.",
      });

      return;
    }

    setFeedback({
      type: "error",
      message: "Wrong answer. Try again.",
    });
  };

  const handleRequestHint = () => {
    if (hintsUsed >= 2 || isHintLoading) {
      return;
    }

    setIsHintLoading(true);

    // Temporary mock delay.
    // Later this will be replaced by the API request.
    setTimeout(() => {
      const nextHintNumber = hintsUsed + 1;

      const hints = [
        "Think about something that follows you.",
        "You can see it when there is light.",
      ];

      setHint(hints[nextHintNumber - 1]);

      setHintsUsed(nextHintNumber);
      setIsHintLoading(false);
    }, 700);
  };

  return (
    <main className="page">
      <div
        className="container"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "var(--space-8)",
          paddingBottom: "var(--space-8)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          <QuestionCard
            questionNumber={1}
            totalQuestions={3}
            question="What follows you everywhere but disappears in the dark?"
            onSubmit={handleSubmit}
            feedback={feedback}
          />

          <HintCard
            hint={hint}
            hintsUsed={hintsUsed}
            maxHints={2}
            onRequestHint={handleRequestHint}
            isLoading={isHintLoading}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
