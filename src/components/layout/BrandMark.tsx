import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/brand/aerasea-blue.png"
        alt="Aerasea"
        className="h-8 w-[120px] object-contain flex-shrink-0 dark:drop-shadow-[0_0_8px_rgba(56,214,255,0.35)]"
      />
      <div>
        <p className="font-display text-lg text-[var(--text)]">Aquanotes</p>
        <p className="text-xs text-muted">Management Tambak</p>
      </div>
    </div>
  );
}
