import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  accent
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5 shadow-card">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className={cn("font-display text-3xl", accent)}>{value}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}
