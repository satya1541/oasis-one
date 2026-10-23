import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandLockupProps {
  variant?: "full" | "mark" | "wordmark" | "horizontal" | "pill";
  className?: string;
  priority?: boolean;
  href?: string;
}

/**
 * BrandLockup — The official OASIS company lockup.
 * Uses the authentic champagne-gold Astrolabe Star Compass Wheel mark
 * on Midnight Navy with geometric typography and Odisha Startup Community identifier.
 */
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
              alt="OASIS Official Logo"
              width={40}
              height={40}
              priority={priority}
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-[0_2px_10px_rgba(243,211,162,0.25)]"
            />
          </div>
        );

      case "wordmark":
        return (
          <div className={cn("flex items-center gap-2.5 select-none", className)}>
            <Image
              src="/brand/oasis-mark.png"
              alt="OASIS Official Logo"
              width={36}
              height={36}
              priority={priority}
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(243,211,162,0.2)]"
            />
            <span className="font-display text-lg sm:text-xl font-normal tracking-[0.22em] text-[var(--brand-cream)] uppercase">
              OASIS
            </span>
          </div>
        );

      case "horizontal":
      case "pill":
        return (
          <div className={cn("flex items-center gap-3 select-none", className)}>
            <div className="relative flex items-center justify-center shrink-0">
              <Image
                src="/brand/oasis-mark.png"
                alt="OASIS Official Logo"
                width={42}
                height={42}
                priority={priority}
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-[0_2px_12px_rgba(243,211,162,0.25)]"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-display text-lg sm:text-xl font-normal tracking-[0.22em] text-[var(--brand-cream)] uppercase leading-none">
                OASIS
              </span>
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
            <Image
              src="/brand/oasis-logo.png"
              alt="OASIS — Odisha · Startup Community"
              width={260}
              height={260}
              priority={priority}
              className="h-auto max-h-[140px] w-auto max-w-[200px] object-contain drop-shadow-[0_4px_16px_rgba(243,211,162,0.2)]"
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
