export interface MysteryListItem {
  id: string
  title: string
  description: string
}

export interface Question {
  id: number
  order: number
  text: string
  maxHints: number
}

export interface Mystery extends MysteryListItem {
  story: string
  questions: Question[]
  finalReveal: string
  nextMysteryId: string | null
}

export type AnswerResponse =
  | {
      correct: false
      message: string
    }
  | {
      correct: true
      message: string
      mysteryCompleted: false
      nextQuestionId: number
    }
  | {
      correct: true
      message: string
      mysteryCompleted: true
      finalReveal: string
      nextMysteryId: string | null
    }

export interface HintResponse {
  hint: string
  hintsRemaining: number
}

export interface ApiErrorResponse {
  message: string
}