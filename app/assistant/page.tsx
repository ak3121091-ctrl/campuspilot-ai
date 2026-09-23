"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatePanel } from "@/components/ui/state-panel";

const promptExamples = [
  "Explain the key concepts in my uploaded notes.",
  "Summarize the selected study material.",
  "What definitions are important in these documents?",
];

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  async function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    setError(null);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const body = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Unable to answer from documents.");
      setAnswer(body.answer ?? null);
    } catch (askError) {
      setError(askError instanceof Error ? askError.message : "Unable to answer from documents.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <AppShell title="AI Study Assistant" subtitle="Document-grounded answers">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Suggested prompts" description="These prompts are sent to the real document Q&A API.">
          <div className="space-y-3">
            {promptExamples.map((prompt) => (
              <button key={prompt} className="w-full rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-left text-sm text-slate-200 transition hover:border-violet-500/50 hover:bg-slate-900" type="button" onClick={() => setQuestion(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Ask about your documents" description="Answers are restricted to text extracted from your uploaded PDFs.">
          <form className="space-y-3" onSubmit={(event) => void askQuestion(event)}>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} rows={4} placeholder="Ask a question about your uploaded study material…" className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-violet-400" />
            <button disabled={asking || !question.trim()} className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50" type="submit">{asking ? "Thinking…" : "Ask assistant"}</button>
          </form>
          {error ? <div className="mt-4"><StatePanel variant="error" title="Assistant unavailable" message={error} action="Check AWS and document configuration" /></div> : null}
          {answer ? <div className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 text-sm leading-6 text-violet-50"><p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-violet-300">Backend response</p>{answer}</div> : null}
          {!answer && !error && !asking ? <div className="mt-4"><StatePanel variant="empty" title="Ask a grounded question" message="If the answer is not present in your uploaded documents, the assistant will say so explicitly." /></div> : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
