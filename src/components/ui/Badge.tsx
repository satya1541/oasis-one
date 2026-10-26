import * as React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "aspiring"
    | "founder"
    | "mentor"
    | "verified-mentor"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "outline";
}

export function Badge({
  className,
  variant = "outline",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full transition-colors",
        // Role variants
        variant === "aspiring" &&
          "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]",
        variant === "founder" &&
          "bg-[var(--brand-navy)] text-[var(--brand-cream)] border border-[var(--brand-gold)]/30",
        variant === "mentor" &&
          "bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--accent)]/30",
        variant === "verified-mentor" &&
          "bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/35 font-semibold shadow-[0_0_12px_rgba(136,222,204,0.2)]",
        variant === "primary" &&
          "bg-[var(--brand-gold)]/20 text-[var(--brand-gold)] border border-[var(--brand-gold)]/40 font-medium",
        // Semantic variants
        variant === "success" &&
          "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700 font-semibold font-mono text-[10px] uppercase tracking-wider",
        variant === "warning" &&
          "bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700 font-semibold font-mono text-[10px] uppercase tracking-wider",
        variant === "danger" &&
          "bg-rose-50 text-rose-900 border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700 font-semibold font-mono text-[10px] uppercase tracking-wider",
        variant === "outline" &&
          "bg-transparent text-[var(--muted)] border border-[var(--border)]",
        className
      )}
      {...props}
    >
      {(variant === "success" || variant === "warning" || variant === "danger") && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variant === "success" && "bg-emerald-600 dark:bg-emerald-400",
            variant === "warning" && "bg-amber-600 dark:bg-amber-400",
            variant === "danger" && "bg-rose-600 dark:bg-rose-400"
          )}
        />
      )}
      {variant === "verified-mentor" && (
        <img
          src="/verified.gif"
          alt="Verified"
          className="w-3.5 h-3.5 object-contain shrink-0 inline-block"
        />
      )}
      {children}
    </span>
  );
}
