import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandLockupProps {
  variant?: "full" | "mark" | "wordmark" | "horizontal";
  className?: string;
  priority?: boolean;
  href?: string;
}

export function BrandLockup({
  variant = "horizontal",
  className,
  priority = false,
  href = "/",
}: BrandLockupProps) {
  const content = (() => {
    switch (variant) {
      case "mark":
        return (
          <div className={cn("relative flex items-center justify-center shrink-0", className)}>
            <Image
              src="/brand/oasis-mark.png"
              alt="OASIS Star Compass Mark"
              width={36}
              height={36}
              priority={priority}
              className="h-9 w-9 object-contain"
            />
          </div>
        );

      case "wordmark":
        return (
          <div className={cn("flex items-center gap-2.5", className)}>
            <Image
              src="/brand/oasis-mark.png"
              alt="OASIS Star Compass Mark"
              width={32}
              height={32}
              priority={priority}
              className="h-8 w-8 object-contain shrink-0"
            />
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display text-lg sm:text-xl font-normal tracking-[0.18em] text-[var(--brand-cream)] uppercase">
                OASIS
              </span>
              <span className="rounded bg-[var(--brand-gold)] px-1.5 py-0.5 font-display text-[10px] font-semibold tracking-wider text-[var(--brand-navy)] uppercase">
                ONE
              </span>
            </div>
          </div>
        );

      case "horizontal":
        return (
          <div className={cn("flex items-center gap-3 select-none", className)}>
            <div className="relative flex items-center justify-center shrink-0">
              <Image
                src="/brand/oasis-mark.png"
                alt="OASIS Star Compass Mark"
                width={38}
                height={38}
                priority={priority}
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display text-lg sm:text-xl font-normal tracking-[0.18em] text-[var(--brand-cream)] uppercase">
                  OASIS
                </span>
                <span className="rounded bg-[var(--brand-gold)] px-1.5 py-0.5 font-display text-[10px] font-semibold tracking-wider text-[var(--brand-navy)] uppercase">
                  ONE
                </span>
              </div>
              <span className="text-[9px] font-medium tracking-[0.2em] text-[var(--brand-gold)]/80 uppercase leading-none mt-1 font-display">
                Odisha · Startup Community
              </span>
            </div>
          </div>
        );

      case "full":
      default:
        return (
          <div className={cn("relative flex items-center justify-center", className)}>
            {/* The full lockup sits strictly on navy */}
            <Image
              src="/brand/oasis-logo.png"
              alt="OASIS — Odisha · Startup Community"
              width={240}
              height={240}
              priority={priority}
              className="h-auto max-h-[140px] w-auto max-w-[200px] object-contain"
            />
          </div>
        );
    }
  })();

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] rounded-lg transition-opacity hover:opacity-95"
      >
        {content}
      </Link>
    );
  }

  return content;
}
