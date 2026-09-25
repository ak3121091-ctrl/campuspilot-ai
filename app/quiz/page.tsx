"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatePanel } from "@/components/ui/state-panel";
import type { QuizAttempt } from "@/types/quiz";
import { apiUrl } from "@/lib/api";

export default function QuizPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const response = await fetch(apiUrl("/api/quiz-attempts"));
        if (!response.ok) {
          throw new Error("Failed to load attempts");
        }
        const data = await response.json();
        setAttempts(data.attempts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load quiz attempts");
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, []);

  return (
    <AppShell title="Quiz" subtitle="Practice and assessment">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Generate new quiz" description="Select documents, subject, and topic to generate grounded quiz questions.">
          <div className="space-y-3 text-sm text-slate-300">
            <p>Quiz generation requires:</p>
            <ul className="list-inside space-y-1">
              <li>• Uploaded documents in a subject</li>
              <li>• Topic selection from the material</li>
              <li>• Question count: 5, 10, or 20</li>
              <li>• Difficulty level preference</li>
            </ul>
            <button className="mt-4 rounded-lg bg-violet-500 px-4 py-2 text-white hover:bg-violet-600">
              Start new quiz →
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Latest attempts" description={`${attempts.length} quiz${attempts.length !== 1 ? "zes" : ""} completed`}>
          {loading ? (
            <StatePanel variant="loading" title="Loading..." message="Fetching quiz attempts" action="Please wait" />
          ) : error ? (
            <StatePanel variant="error" title="Error" message={error} action="Try again" />
          ) : attempts.length === 0 ? (
            <StatePanel
              variant="empty"
              title="No attempts yet"
              message="Complete your first quiz to see scores and performance data here."
              action="Generate quiz"
            />
          ) : (
            <div className="space-y-3">
              {attempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Quiz: {attempt.quizId.slice(0, 8)}</p>
                      <p className="text-xs text-slate-400">{new Date(attempt.attemptedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-lg font-semibold text-violet-300">{attempt.score}%</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {Math.round((attempt.score / 100) * attempt.totalQuestions)}/{attempt.totalQuestions} correct
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
