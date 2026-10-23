import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface GlassLogoPillProps {
  href?: string;
  className?: string;
  badge?: string;
}

export function GlassLogoPill({ href = "/", className, badge }: GlassLogoPillProps) {
  return (
    <Link
      href={href}
      className={cn("join-logo-pill group", className)}
      aria-label="OASIS home"
    >
      <div className="w-[30px] h-[30px] rounded-full bg-[#030909] border border-[#F3D3A2]/25 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        <Image
          src="/brand/oasis-mark.png"
          alt="OASIS Official Logo"
          width={24}
          height={24}
          className="w-[22px] h-[22px] object-contain drop-shadow-[0_2px_6px_rgba(243,211,162,0.35)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center gap-1.5 pl-2 select-none">
        <span className="font-semibold text-xs sm:text-sm tracking-[0.2em] text-[#F5FAF6] uppercase leading-none">
          OASIS
        </span>
        {badge && (
          <span className="font-bold text-[8px] sm:text-[9px] tracking-wider bg-[#F3D3A2] text-[#12131F] px-1.5 py-0.5 rounded leading-none uppercase">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
