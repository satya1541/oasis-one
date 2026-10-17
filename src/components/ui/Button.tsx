import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "destructive";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 relative overflow-hidden group",
          // Variants
          variant === "primary" &&
            "bg-[var(--brand-navy)] text-[var(--brand-cream)] hover:bg-[#25263d] border border-[var(--brand-gold)]/30 shadow-[0_2px_8px_rgba(30,31,51,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(30,31,51,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-[var(--brand-gold)]/50",
          variant === "secondary" &&
            "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)] shadow-[0_1px_2px_rgba(30,31,51,0.04)] hover:shadow-[0_4px_12px_rgba(30,31,51,0.06)]",
          variant === "outline" &&
            "bg-white/[0.04] text-[var(--brand-cream)] border border-[var(--brand-gold)]/35 hover:border-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/10 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
          variant === "ghost" &&
            "bg-transparent text-[var(--text)] hover:bg-[var(--surface-2)]/80 hover:text-[var(--text)]",
          variant === "gold" &&
            "bg-gradient-to-b from-[#F7DFBA] to-[#E9C68C] text-[var(--brand-navy)] font-semibold border border-[#DEB778] shadow-[0_4px_14px_rgba(233,198,140,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:brightness-105 hover:shadow-[0_6px_20px_rgba(233,198,140,0.5)]",
          variant === "destructive" &&
            "bg-[var(--danger)] text-white hover:bg-[#A33B2E] border border-rose-400/40 shadow-[0_4px_12px_rgba(182,69,54,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]",
          // Sizes
          size === "sm" && "h-9 px-4 text-xs rounded-xl tracking-tight",
          size === "md" && "h-11 px-5 text-sm rounded-[14px] tracking-tight",
          size === "lg" && "h-12 px-7 text-base rounded-[16px] tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
