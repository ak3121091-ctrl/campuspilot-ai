export type QuizDifficulty = "easy" | "medium" | "hard";
export type QuizQuestionCount = 5 | 10 | 20;

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  difficulty: QuizDifficulty;
};

export type Quiz = {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  documentIds: string[];
  questions: QuizQuestion[];
  questionCount: QuizQuestionCount;
  generatedAt: string;
};

export type QuizAttempt = {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  attemptedAt: string;
};

export type QuizAttemptDetail = QuizAttempt & {
  quiz: Quiz;
  results: Array<{
    question: QuizQuestion;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
};
