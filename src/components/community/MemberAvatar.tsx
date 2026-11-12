"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "./types";

interface MemberAvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<MemberAvatarProps["size"]>, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-xs",
  lg: "w-12 h-12 text-sm",
};

export function MemberAvatar({
  name,
  src,
  size = "md",
  className,
}: MemberAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src && failedSrc === src);
  const initials = getInitials(name);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || "Member"}
        onError={() => setFailedSrc(src)}
        className={cn(
          "rounded-full object-cover border border-[var(--border)] bg-[var(--surface-2)] shrink-0",
          SIZE_CLASSES[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-[var(--primary-soft)] text-[var(--text)] border border-[var(--border)] font-semibold flex items-center justify-center shrink-0 select-none",
        SIZE_CLASSES[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
