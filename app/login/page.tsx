"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { apiUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@campuspilot.ai");
  const [password, setPassword] = useState("campus123");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Unable to sign in.");
      router.push("/");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl shadow-violet-950/30">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-sky-500 to-emerald-400 text-lg font-bold text-white">
            C
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-violet-300">CampusPilot</p>
            <h1 className="text-2xl font-semibold text-white">Student login</h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block text-sm text-slate-300">
            <span className="mb-2 block">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-violet-400"
              placeholder="you@campus.edu"
            />
          </label>

          <label className="block text-sm text-slate-300">
            <span className="mb-2 block">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-violet-400"
              placeholder="Enter your password"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-violet-500 px-4 py-2.5 font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300">
          <p className="font-medium text-white">Demo access</p>
          <p className="mt-1 text-slate-400">Use any valid email and a password with at least 6 characters to enter the dashboard.</p>
        </div>

        <p className="mt-5 text-center text-sm text-slate-400">
          Need a guide? <Link href="/" className="text-violet-300">Back to app</Link>
        </p>
      </div>
    </div>
  );
}
