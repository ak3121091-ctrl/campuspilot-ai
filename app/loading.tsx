export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-center shadow-lg shadow-slate-950/30">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-300" />
        <p className="mt-4 text-lg font-semibold text-white">Loading CampusPilot</p>
        <p className="mt-2 text-sm text-slate-400">Preparing your student dashboard and resources.</p>
      </div>
    </main>
  );
}
