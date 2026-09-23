export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export type StatCardItem = {
  title: string;
  value: string;
  detail: string;
  trend: string;
  tone: "green" | "blue" | "purple" | "amber";
};

export type TodayTask = {
  title: string;
  subject: string;
  time: string;
  status: "Due today" | "In progress" | "Completed";
};

export type RecentDocument = {
  name: string;
  subject: string;
  type: string;
  status: "Processed" | "Queued" | "Needs review";
  updatedAt: string;
};

export type StudyRecommendation = {
  title: string;
  detail: string;
  priority: "High" | "Medium" | "Low";
};

export type QuizSummary = {
  title: string;
  score: string;
  date: string;
  difficulty: string;
};
