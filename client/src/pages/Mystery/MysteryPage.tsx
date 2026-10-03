import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ApiError,
  getMysteryById,
  requestHint as fetchHint,
  submitAnswer as sendAnswer,
} from '../../services/api'
import type { HintResponse, Mystery, Question } from '../../types/mystery.types'

export interface MysteryGameplayProps {
  mystery: Mystery
  question: Question
  feedback: { type: 'success' | 'error'; message: string } | null
  hint: HintResponse | null
  hintsRemaining: number
  hintsUsed: number
  isSubmitting: boolean
  isRequestingHint: boolean
  submitAnswer: (answer: string) => Promise<void>
  requestHint: () => Promise<void>
}

interface MysteryPageProps {
  children?: (gameplay: MysteryGameplayProps) => ReactNode
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export default function MysteryPage({ children }: MysteryPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mystery, setMystery] = useState<Mystery | null>(null)
  const [questionId, setQuestionId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<MysteryGameplayProps['feedback']>(null)
  const [hint, setHint] = useState<HintResponse | null>(null)
  const [hintsRemaining, setHintsRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRequestingHint, setIsRequestingHint] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoadError('Mystery ID is missing from the URL.')
      setIsLoading(false)
      return
    }

    let isCurrentRequest = true
    setIsLoading(true)
    setLoadError(null)
    setMystery(null)
    setQuestionId(null)

    getMysteryById(id)
      .then((loadedMystery) => {
        if (!isCurrentRequest) return

        if (loadedMystery.completed) {
          navigate(`/result/${encodeURIComponent(id)}`, { replace: true })
          return
        }

        const currentQuestion = loadedMystery.questions.find(
          (item) => item.id === loadedMystery.currentQuestionId,
        )

        if (!currentQuestion) {
          setLoadError('The current question is unavailable for this mystery.')
          return
        }

        setMystery(loadedMystery)
        setQuestionId(currentQuestion.id)
        setHintsRemaining(
          currentQuestion.maxHints -
            (loadedMystery.hintsUsed[String(currentQuestion.id)] ?? 0),
        )
      })
      .catch((error: unknown) => {
        if (isCurrentRequest) setLoadError(getErrorMessage(error))
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [id, navigate])

  const orderedQuestions = mystery
    ? [...mystery.questions].sort((left, right) => left.order - right.order)
    : []
  const question = orderedQuestions.find((item) => item.id === questionId)

  async function submitAnswer(answer: string): Promise<void> {
    if (!id || !question || isSubmitting) return

    setIsSubmitting(true)
    setActionError(null)
    setFeedback(null)

    try {
      const result = await sendAnswer(id, question.id, answer)

      if (!result.correct) {
        setFeedback({ type: 'error', message: result.message })
        return
      }

      if (result.mysteryCompleted) {
        navigate(`/result/${encodeURIComponent(id)}`, {
          state: {
            finalReveal: result.finalReveal,
            nextMysteryId: result.nextMysteryId,
          },
        })
        return
      }

      const nextQuestion = orderedQuestions.find(
        (item) => item.id === result.nextQuestionId,
      )

      if (!nextQuestion) {
        setActionError('The server returned an invalid next question.')
        return
      }

      setQuestionId(nextQuestion.id)
      setHintsRemaining(nextQuestion.maxHints)
      setHint(null)
      setFeedback({ type: 'success', message: result.message })
    } catch (error: unknown) {
      setActionError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function requestCurrentHint(): Promise<void> {
    if (!id || !question || isRequestingHint || hintsRemaining <= 0) return

    setIsRequestingHint(true)
    setActionError(null)

    try {
      const nextHint = await fetchHint(id, question.id)
      setHint(nextHint)
      setHintsRemaining(nextHint.hintsRemaining)
    } catch (error: unknown) {
      setActionError(getErrorMessage(error))
    } finally {
      setIsRequestingHint(false)
    }
  }

  if (isLoading) {
    return <main aria-busy="true">Loading mystery...</main>
  }

  if (loadError || !mystery || !question) {
    return (
      <main>
        <p role="alert">{loadError ?? 'Mystery data is unavailable.'}</p>
      </main>
    )
  }

  const gameplay: MysteryGameplayProps = {
    mystery,
    question,
    feedback,
    hint,
    hintsRemaining,
    hintsUsed: question.maxHints - hintsRemaining,
    isSubmitting,
    isRequestingHint,
    submitAnswer,
    requestHint: requestCurrentHint,
  }

  return (
    <main>
      <header>
        <h1>{mystery.title}</h1>
        <p>{mystery.description}</p>
      </header>

      <section aria-labelledby="mystery-story-heading">
        <h2 id="mystery-story-heading">Story</h2>
        <p>{mystery.story}</p>
      </section>

      <section aria-labelledby="mystery-question-heading">
        <h2 id="mystery-question-heading">
          Question {question.order} of {orderedQuestions.length}
        </h2>
        {children ? (
          children(gameplay)
        ) : (
          <>
            <p>{question.text}</p>
            <p>{gameplay.hintsUsed} hint(s) used</p>
          </>
        )}
        {feedback && <p role="status">{feedback.message}</p>}
        {actionError && <p role="alert">{actionError}</p>}
      </section>
    </main>
  )
}