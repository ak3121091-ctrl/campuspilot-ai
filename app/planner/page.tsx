"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatePanel } from "@/components/ui/state-panel";
import type { StudyPlan } from "@/types/study";
import { apiUrl } from "@/lib/api";

export default function PlannerPage() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const response = await fetch(apiUrl("/api/study-planner"));
        if (!response.ok) {
          throw new Error("Failed to load study plan");
        }
        const data = await response.json();
        setPlan(data.plan);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load study plan");
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, []);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl("/api/study-planner"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          subjects: ["Data Structures", "Operating Systems", "DBMS"],
          currentLevel: "intermediate",
          dailyStudyHours: 3,
          topics: ["Arrays", "Linked Lists", "Trees", "Process Management", "SQL Queries"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const data = await response.json();
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    try {
      const response = await fetch(apiUrl("/api/study-planner"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      if (plan) {
        setPlan({
          ...plan,
          tasks: plan.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: true } : t
          ),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update task");
    }
  };

  return (
    <AppShell title="Study Planner" subtitle="AI-generated personalized study path">
      <SectionCard
        title="AI-generated study path"
        description="A personalized day-by-day plan based on your subjects, exam date, and daily study hours."
      >
        {loading ? (
          <StatePanel variant="loading" title="Loading..." message="Fetching study plan" action="Please wait" />
        ) : error ? (
          <StatePanel variant="error" title="Error" message={error} action="Try again" />
        ) : !plan ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">Create a personalized study plan by providing your exam date, subjects, and daily study hours.</p>
            <button
              onClick={handleGeneratePlan}
              className="rounded-lg bg-violet-500 px-4 py-2 text-white hover:bg-violet-600"
            >
              Generate study plan →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mb-4 rounded-lg bg-slate-900/40 p-3 text-sm text-slate-300">
              <p>Exam: {new Date(plan.examDate).toLocaleDateString()}</p>
              <p>{plan.dailyStudyHours} hours/day across {plan.subjects.join(", ")}</p>
            </div>
            <div className="space-y-2">
              {plan.tasks.slice(0, 14).map((task, idx) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    task.completed ? "border-emerald-800/40 bg-emerald-950/20" : "border-slate-800 bg-slate-950/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleMarkComplete(task.id)}
                    className="h-5 w-5 rounded accent-violet-500"
                  />
                  <div className="flex-1 text-sm">
                    <p className={task.completed ? "line-through text-slate-500" : "text-slate-200"}>
                      Day {idx + 1}: {task.topic}
                    </p>
                    <p className="text-xs text-slate-400">
                      {task.subject} • {task.estimatedHours}h • Priority: {task.priority}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
