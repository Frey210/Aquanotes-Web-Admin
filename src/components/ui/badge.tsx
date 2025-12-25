import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "danger" }) {
  const variants = {
    default: "bg-black/5 text-[var(--text)] dark:bg-white/10",
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
    warning: "bg-amber-400/20 text-amber-800 dark:text-amber-100",
    danger: "bg-rose-500/20 text-rose-700 dark:text-rose-100"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
