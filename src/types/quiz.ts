
export type QuestionType = "multiple-choice" | "true-false" | "short-answer";

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  courseId: number;
  passingScore: number;
  timeLimit: number; // in minutes
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  score: number;
  totalPossible: number;
  startTime: Date;
  endTime: Date;
  answers: {
    questionId: number;
    userAnswer: string | string[];
    isCorrect: boolean;
  }[];
}
