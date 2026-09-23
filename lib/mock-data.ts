import type { NavItem, QuizSummary, RecentDocument, StatCardItem, StudyRecommendation, TodayTask } from "@/types/app";

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "⌂" },
  { href: "/documents", label: "My Documents", icon: "▣" },
  { href: "/assistant", label: "AI Study Assistant", icon: "✦" },
  { href: "/quiz", label: "Quiz", icon: "◫" },
  { href: "/planner", label: "Study Planner", icon: "✓" },
  { href: "/progress", label: "Progress", icon: "▤" },
  { href: "/college", label: "College Knowledge", icon: "◌" },
  { href: "/profile", label: "Profile", icon: "◎" },
];

export const dashboardStats: StatCardItem[] = [
  {
    title: "Documents processed",
    value: "24",
    detail: "+5 this week",
    trend: "on track",
    tone: "blue",
  },
  {
    title: "Study streak",
    value: "11 days",
    detail: "Strong consistency",
    trend: "up 3 days",
    tone: "green",
  },
  {
    title: "Quiz accuracy",
    value: "82%",
    detail: "Across 6 attempts",
    trend: "+9%",
    tone: "purple",
  },
  {
    title: "Tasks complete",
    value: "14/18",
    detail: "3 due today",
    trend: "78%",
    tone: "amber",
  },
];

export const todayTasks: TodayTask[] = [
  { title: "Revise DSA arrays practice set", subject: "Data Structures", time: "09:00 AM", status: "Due today" },
  { title: "Summarize operating system notes", subject: "OS", time: "12:30 PM", status: "In progress" },
  { title: "Attempt mini MCQ set", subject: "DBMS", time: "06:00 PM", status: "Completed" },
];

export const recentDocuments: RecentDocument[] = [
  { name: "Linked Lists Notes.pdf", subject: "DSA", type: "PDF", status: "Processed", updatedAt: "2 hours ago" },
  { name: "Unit 3 Question Bank.pdf", subject: "Operating Systems", type: "PDF", status: "Queued", updatedAt: "Today" },
  { name: "Academic Calendar.pdf", subject: "College Knowledge", type: "PDF", status: "Needs review", updatedAt: "Yesterday" },
];

export const recommendations: StudyRecommendation[] = [
  { title: "Revise linked lists", detail: "Your latest quiz performance shows a gap in pointer-based traversal and stack usage.", priority: "High" },
  { title: "Practice DBMS normalization", detail: "Two recent questions were missed on dependency and 3NF reasoning.", priority: "Medium" },
  { title: "Review lecture summary", detail: "Use the uploaded note set to reinforce key definitions before your next viva session.", priority: "Low" },
];

export const quizSummary: QuizSummary[] = [
  { title: "Arrays + recursion", score: "90%", date: "Today", difficulty: "Medium" },
  { title: "Trees and traversal", score: "76%", date: "Yesterday", difficulty: "Hard" },
  { title: "DBMS schema quiz", score: "88%", date: "Mon", difficulty: "Medium" },
];

export const plannerDays = [
  "Day 1: Arrays + recap quiz",
  "Day 2: Linked lists + practice set",
  "Day 3: Stacks + viva rehearsal",
  "Day 4: Tree traversal + notes review",
  "Day 5: DBMS normalization + test",
];

export const progressBars = [
  { label: "DSA", value: 82 },
  { label: "OS", value: 68 },
  { label: "DBMS", value: 76 },
  { label: "Maths", value: 61 },
];
