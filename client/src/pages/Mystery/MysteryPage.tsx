import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import HintCard from "../../components/hint/HintCard";
import RoomHero from "../../components/mystery/RoomHero";
import RoomSidebar from "../../components/mystery/RoomSidebar";
import QuestionCard from "../../components/question/QuestionCard";
import { useNotification } from "../../context/NotificationContext";
import {
  ApiError,
  getMysteries,
  getMysteryById,
  requestHint as fetchHint,
  submitAnswer as sendAnswer,
} from "../../services/api";
import type {
  HintResponse,
  Mystery,
  MysteryListItem,
} from "../../types/mystery.types";

import "./MysteryPage.css";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export default function MysteryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [mystery, setMystery] = useState<Mystery | null>(null);
  const [rooms, setRooms] = useState<MysteryListItem[]>([]);
  const [questionId, setQuestionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [hint, setHint] = useState<HintResponse | null>(null);
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingHint, setIsRequestingHint] = useState(false);

  async function loadMystery() {
    if (!id) {
      setLoadError("Mystery ID is missing from the URL.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setMystery(null);
    setRooms([]);
    setQuestionId(null);
    setHint(null);
    setHintsRemaining(0);
    setFeedback(null);
    setActionError(null);

    try {
      const [loaded, availableRooms] = await Promise.all([
        getMysteryById(id),
        getMysteries(),
      ]);

      if (loaded.completed) {
        navigate(`/result/${encodeURIComponent(id)}`, { replace: true });
        return;
      }

      const current = loaded.questions.find(
        (question) => question.id === loaded.currentQuestionId,
      );

      if (!current) {
        setLoadError("The server returned no valid current question.");
        return;
      }

      const used = loaded.hintsUsed[String(current.id)] ?? 0;

      setMystery(loaded);
      setRooms(availableRooms);
      setQuestionId(current.id);
      setHintsRemaining(Math.max(current.maxHints - used, 0));
    } catch (error: unknown) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMystery();
  }, [id, navigate]);

  const orderedQuestions = mystery
    ? [...mystery.questions].sort((a, b) => a.order - b.order)
    : [];

  const question = orderedQuestions.find((item) => item.id === questionId);

  async function submitAnswer(answer: string) {
    if (!id || !question || isSubmitting) return;

    setIsSubmitting(true);
    setActionError(null);
    setFeedback(null);

    try {
      const result = await sendAnswer(id, question.id, answer);

      if (!result.correct) {
        setFeedback({ type: "error", message: result.message });
        return;
      }

      showNotification("success", result.message);

      if (result.mysteryCompleted) {
        navigate(`/result/${encodeURIComponent(id)}`, {
          state: {
            finalReveal: result.finalReveal,
            nextMysteryId: result.nextMysteryId,
          },
        });
        return;
      }

      const refreshed = await getMysteryById(id);
      const next = refreshed.questions.find(
        (item) => item.id === refreshed.currentQuestionId,
      );

      if (!next) {
        setActionError("The server returned no valid next question.");
        return;
      }

      const used = refreshed.hintsUsed[String(next.id)] ?? 0;

      setMystery(refreshed);
      setQuestionId(next.id);
      setHintsRemaining(Math.max(next.maxHints - used, 0));
      setHint(null);
      setFeedback({ type: "success", message: result.message });
    } catch (error: unknown) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function requestCurrentHint() {
    if (!id || !question || isRequestingHint || hintsRemaining <= 0) return;

    setIsRequestingHint(true);
    setActionError(null);

    try {
      const nextHint = await fetchHint(id, question.id);

      setHint(nextHint);
      setHintsRemaining(nextHint.hintsRemaining);
      setMystery((current) =>
        current
          ? {
              ...current,
              hintsUsed: {
                ...current.hintsUsed,
                [String(question.id)]:
                  question.maxHints - nextHint.hintsRemaining,
              },
            }
          : current,
      );
    } catch (error: unknown) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsRequestingHint(false);
    }
  }

  if (isLoading) {
    return (
      <main aria-busy="true">
        <p>Loading mystery...</p>
      </main>
    );
  }

  if (loadError || !mystery || !question) {
    return (
      <main>
        <p role="alert">{loadError ?? "Mystery data is unavailable."}</p>
      </main>
    );
  }

  const hintsUsed = question.maxHints - hintsRemaining;

  return (
    <main className="mystery-page">
      <div className="mystery-page__container container">
        <div className="mystery-page__topbar">
          <div>
            <span className="mystery-page__eyebrow">
              Mystery Room / Investigation
            </span>
            <p className="mystery-page__status">
              The truth is hidden in the details.
            </p>
          </div>

          <span className="mystery-page__question-count">
            Question {question.order} / {orderedQuestions.length}
          </span>
        </div>

        <div className="mystery-layout">
          <RoomSidebar
            rooms={rooms}
            currentRoomTitle={mystery.title}
            currentRoomId={mystery.id}
            completedQuestions={Math.max(question.order - 1, 0)}
            totalQuestions={orderedQuestions.length}
          />

          <RoomHero
            mysteryId={mystery.id}
            title={mystery.title}
            description={mystery.description}
            story={mystery.story}
            questionNumber={question.order}
            totalQuestions={orderedQuestions.length}
          />

          <aside
            id="mystery-question-panel"
            className="mystery-question-panel"
          >
            <QuestionCard
              questionId={question.id}
              questionNumber={question.order}
              totalQuestions={orderedQuestions.length}
              question={question.text}
              onSubmit={submitAnswer}
              isSubmitting={isSubmitting}
              feedback={feedback ?? undefined}
            />

            <HintCard
              hint={hint?.hint}
              hintsUsed={hintsUsed}
              maxHints={question.maxHints}
              onRequestHint={requestCurrentHint}
              isLoading={isRequestingHint}
            />

            {actionError && (
              <p className="mystery-page__action-error" role="alert">
                {actionError}
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
