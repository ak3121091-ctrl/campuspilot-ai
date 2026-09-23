'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="max-w-md rounded-2xl border border-rose-500/30 bg-slate-900/80 p-6 text-center shadow-lg shadow-slate-950/30">
        <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-200 ring-1 ring-rose-500/20">
          ERROR
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-white">Something went wrong</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The CampusPilot dashboard could not load a view. This is a placeholder error state until the live backend is connected.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
