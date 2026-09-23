type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  trend: string;
  tone: "green" | "blue" | "purple" | "amber";
};

const toneMap: Record<StatCardProps["tone"], string> = {
  green: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25",
  blue: "bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/25",
  purple: "bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/25",
  amber: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/25",
};

export function StatCard({ title, value, detail, trend, tone }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${toneMap[tone]}`}>
          {trend}
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-300">{detail}</p>
    </div>
  );
}
