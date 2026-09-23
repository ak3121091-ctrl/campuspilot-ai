export type StudyPlanTask = {
  id: string;
  date: string;
  topic: string;
  subject: string;
  estimatedHours: number;
  completed: boolean;
  priority: "high" | "medium" | "low";
};

export type StudyPlan = {
  id: string;
  userId: string;
  examDate: string;
  subjects: string[];
  currentLevel: "beginner" | "intermediate" | "advanced";
  dailyStudyHours: number;
  topics: string[];
  tasks: StudyPlanTask[];
  createdAt: string;
  updatedAt: string;
};

export type StudyRecommendationItem = {
  id: string;
  userId: string;
  topic: string;
  subject: string;
  reason: string;
  priority: "high" | "medium" | "low";
  recommendationType: "revision" | "quiz";
  createdAt: string;
};

export type SubjectProgress = {
  subject: string;
  topicsAttempted: number;
  correctAnswers: number;
  totalAttempts: number;
  averageScore: number;
  weakTopics: string[];
};

export type ProgressSnapshot = {
  userId: string;
  totalQuizzesAttempted: number;
  averageScore: number;
  subjectProgress: Record<string, SubjectProgress>;
  lastUpdated: string;
};
