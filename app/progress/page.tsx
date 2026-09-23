"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatePanel } from "@/components/ui/state-panel";
import type { ProgressSnapshot, SubjectProgress } from "@/types/study";

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [recommendations, setRecommendations] = useState<
    Array<{ topic: string; subject: string; reason: string; priority: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progressResponse = await fetch("/api/progress");
        if (!progressResponse.ok) {
          throw new Error("Failed to load progress");
        }
        const progressData = await progressResponse.json();
        setProgress(progressData.progress);

        const recsResponse = await fetch("/api/progress?action=recommendations");
        if (recsResponse.ok) {
          const recsData = await recsResponse.json();
          setRecommendations(recsData.recommendations || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load progress");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/progress?action=refresh");
      if (!response.ok) {
        throw new Error("Failed to refresh progress");
      }
      const data = await response.json();
      setProgress(data.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Progress" subtitle="Performance insights and recommendations">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Subject mastery"
          description="Your current progress across subjects based on quiz attempts and performance."
        >
          {loading ? (
            <StatePanel variant="loading" title="Loading..." message="Fetching progress data" action="Please wait" />
          ) : error ? (
            <StatePanel variant="error" title="Error" message={error} action="Try again" />
          ) : !progress || Object.keys(progress.subjectProgress).length === 0 ? (
            <StatePanel
              variant="empty"
              title="No progress yet"
              message="Complete quiz attempts to see subject-wise progress and mastery insights."
              action="Start quiz"
            />
          ) : (
            <div className="space-y-4">
              {Object.values(progress.subjectProgress).map((subj: SubjectProgress) => (
                <div key={subj.subject}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{subj.subject}</span>
                    <span>{subj.averageScore}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-400"
                      style={{ width: `${subj.averageScore}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {subj.totalAttempts} attempt{subj.totalAttempts !== 1 ? "s" : ""} • {subj.topicsAttempted} topics
                  </p>
                </div>
              ))}
              <button
                onClick={handleRefresh}
                className="mt-4 w-full rounded-lg bg-violet-500 px-3 py-2 text-sm text-white hover:bg-violet-600"
              >
                Refresh progress
              </button>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Study recommendations"
          description="AI-generated suggestions based on your performance and weak areas."
        >
          {recommendations.length === 0 ? (
            <StatePanel
              variant="empty"
              title="No recommendations yet"
              message="Complete more quizzes to get personalized study recommendations."
              action="Take quiz"
            />
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 text-sm ${
                    rec.priority === "high"
                      ? "border-red-800/40 bg-red-950/20"
                      : "border-slate-800 bg-slate-950/40"
                  }`}
                >
                  <p className="font-medium text-slate-200">{rec.topic}</p>
                  <p className="text-xs text-slate-400">{rec.subject}</p>
                  <p className="mt-1 text-xs text-slate-300">{rec.reason}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
