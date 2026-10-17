import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  variant?: "default" | "glass" | "navy" | "subtle";
}

export function Card({
  className,
  hoverEffect = false,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden",
        variant === "default" &&
          "bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_3px_rgba(30,31,51,0.04),0_8px_24px_-8px_rgba(30,31,51,0.06)]",
        variant === "subtle" &&
          "bg-[var(--surface-2)]/70 border border-[var(--border)]/70 shadow-[0_1px_2px_rgba(30,31,51,0.03)]",
        variant === "glass" &&
          "bg-white/80 dark:bg-[#1E1F33]/80 backdrop-blur-xl border border-[var(--border)]/60 shadow-[0_12px_32px_-12px_rgba(30,31,51,0.1),inset_0_1px_1px_rgba(255,255,255,0.7)]",
        variant === "navy" &&
          "bg-[var(--brand-navy)] text-[var(--brand-cream)] border border-[var(--brand-gold)]/20 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]",
        hoverEffect &&
          "hover:border-[var(--accent)]/45 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(30,31,51,0.06),0_20px_40px_-12px_rgba(30,31,51,0.12)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-medium tracking-tight text-[var(--text)]",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-[var(--muted)] leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-0", className)} {...props} />;
}
