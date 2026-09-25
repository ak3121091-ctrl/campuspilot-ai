"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { navItems } from "@/lib/mock-data";
import { apiUrl } from "@/lib/api";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch(apiUrl("/api/auth/logout"), { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-sky-500 to-emerald-400 text-lg font-bold text-white">
              C
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-violet-300">CampusPilot</p>
              <h1 className="text-xl font-semibold text-white">AI Learning</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-base text-violet-200">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 text-sm text-violet-100">
            <p className="font-medium">AI study mode</p>
            <p className="mt-2 text-violet-200/80">Grounded from your uploaded campus documents and approved notes.</p>
          </div>
        </aside>

        <main className="flex-1">
          <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Student workspace</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
                {subtitle}
              </div>
              <Link href="/documents" className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400">
                + New upload
              </Link>
              <button type="button" onClick={() => void handleLogout()} className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
                Log out
              </button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
