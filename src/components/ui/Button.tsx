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
          "inline-flex items-center justify-center font-medium transition-all active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
          // Variants
          variant === "primary" &&
            "bg-[var(--brand-navy)] text-[var(--brand-cream)] hover:bg-[#282942] border border-[var(--brand-gold)]/25 shadow-sm",
          variant === "secondary" &&
            "bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-2)]",
          variant === "outline" &&
            "bg-transparent text-[var(--brand-cream)] border border-[var(--brand-gold)]/30 hover:border-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/5",
          variant === "ghost" &&
            "bg-transparent text-[var(--text)] hover:bg-[var(--surface-2)]",
          variant === "gold" &&
            "bg-[var(--accent-fill)] text-[var(--brand-navy)] font-semibold hover:bg-[#DEB778] shadow-xs",
          variant === "destructive" &&
            "bg-[var(--danger)] text-white hover:bg-[#A33B2E] border border-rose-300 shadow-xs",
          // Sizes
          size === "sm" && "h-9 px-3.5 text-xs rounded-[10px]",
          size === "md" && "h-11 px-5 text-sm rounded-[12px]",
          size === "lg" && "h-12 px-7 text-base rounded-[14px]",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
