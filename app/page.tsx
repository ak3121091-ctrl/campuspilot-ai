import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatePanel } from "@/components/ui/state-panel";
import { dashboardStats, progressBars, quizSummary, recentDocuments, recommendations, todayTasks } from "@/lib/mock-data";

const upcomingExams = [
  { title: "Operating Systems Midterm", date: "12 Oct • 10:00 AM", subject: "OS" },
  { title: "DSA Lab Viva", date: "18 Oct • 1:30 PM", subject: "Data Structures" },
  { title: "DBMS Quiz", date: "22 Oct • 9:00 AM", subject: "DBMS" },
];

export default function HomePage() {
  return (
    <AppShell title="Dashboard" subtitle="Welcome back, Ananya">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Today’s tasks"
          description="Keep momentum across your current subjects and exam prep."
          action={
            <Link href="/planner" className="text-sm font-medium text-violet-300 hover:text-violet-200">
              View planner →
            </Link>
          }
        >
          <div className="space-y-3">
            {todayTasks.length ? (
              todayTasks.map((task) => (
                <div key={task.title} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div>
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {task.subject} • {task.time}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      task.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : task.status === "Due today"
                          ? "bg-amber-500/10 text-amber-300"
                          : "bg-sky-500/10 text-sky-300"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))
            ) : (
              <StatePanel variant="empty" title="No tasks scheduled" message="Add a study plan to see daily tasks here." />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Study progress" description="Progress across your main subjects.">
          <div className="space-y-4">
            {progressBars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{bar.label}</span>
                  <span>{bar.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-400" style={{ width: `${bar.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Recent documents"
          description="Your latest uploaded and processed learning materials."
          action={
            <Link href="/documents" className="text-sm font-medium text-violet-300 hover:text-violet-200">
              Manage files →
            </Link>
          }
        >
          <div className="space-y-3">
            {recentDocuments.length ? (
              recentDocuments.map((document) => (
                <div key={document.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div>
                    <p className="font-medium text-white">{document.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {document.subject} • {document.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="mb-2 block rounded-full bg-sky-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-sky-200">
                      {document.status}
                    </span>
                    <p className="text-xs text-slate-400">{document.updatedAt}</p>
                  </div>
                </div>
              ))
            ) : (
              <StatePanel variant="empty" title="No recent files" message="Upload a syllabus, note, or lab manual to populate this section." />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming exams" description="Keep your revision timeline aligned to key assessments.">
          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div key={exam.title} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{exam.title}</p>
                  <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-200">
                    {exam.subject}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{exam.date}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Adaptive recommendation"
          description="Based on your recent quiz performance and study flow."
        >
          <div className="space-y-3">
            {recommendations.length ? (
              recommendations.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-white">{item.title}</p>
                    <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-violet-200">
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                </div>
              ))
            ) : (
              <StatePanel variant="empty" title="No recommendations yet" message="Complete a few quizzes to generate adaptive suggestions." />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Recent quiz score" description="Recent attempts and score confidence.">
          <div className="space-y-3">
            {quizSummary.length ? (
              quizSummary.map((quiz) => (
                <div key={quiz.title} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-white">{quiz.title}</p>
                    <span className="text-lg font-semibold text-emerald-300">{quiz.score}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                    <span>{quiz.date}</span>
                    <span>{quiz.difficulty}</span>
                  </div>
                </div>
              ))
            ) : (
              <StatePanel variant="loading" title="Loading quiz history" message="Fetching the latest quiz performance data." />
            )}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
