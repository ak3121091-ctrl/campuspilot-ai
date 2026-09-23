type StatePanelProps = {
  variant: "loading" | "empty" | "error";
  title: string;
  message: string;
  action?: string;
};

export function StatePanel({ variant, title, message, action }: StatePanelProps) {
  const styles = {
    loading: {
      badge: "bg-sky-500/10 text-sky-200 ring-1 ring-sky-500/20",
      emoji: "⏳",
    },
    empty: {
      badge: "bg-slate-700 text-slate-200 ring-1 ring-slate-600",
      emoji: "•",
    },
    error: {
      badge: "bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/20",
      emoji: "!",
    },
  }[variant];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 text-center">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles.badge}`}>
        {styles.emoji} {variant.toUpperCase()}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
      {action ? (
        <div className="mt-4 inline-flex rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200">
          {action}
        </div>
      ) : null}
    </div>
  );
}
