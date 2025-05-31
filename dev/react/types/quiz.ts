export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizAttrs {
  question: string
  options: QuizOption[]
  selectedAnswer?: string
  showResult: boolean
}