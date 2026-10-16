"use client";

import { cn } from "@/lib/utils";

interface AstrolabeStarProps {
  className?: string;
  size?: number;
}

const CX = 250;
const CY = 250;
const OUTER_R = 190;
const INNER_R = 45;
const MID_R = 130;

// Precompute star points with fixed 2-decimal precision to prevent SSR / Client hydration float drift
const STAR_POINTS = Array.from({ length: 24 })
  .map((_, i) => {
    const angle = (i * 15 * Math.PI) / 180 - Math.PI / 2;
    const r = i % 2 === 0 ? (i % 4 === 0 ? OUTER_R : MID_R) : INNER_R;
    const x = (CX + r * Math.cos(angle)).toFixed(2);
    const y = (CY + r * Math.sin(angle)).toFixed(2);
    return `${x},${y}`;
  })
  .join(" ");

// Precompute perimeter coordinate ticks with fixed 2-decimal strings
const TICKS = Array.from({ length: 72 }).map((_, i) => {
  const angle = (i * 5 * Math.PI) / 180;
  const isMajor = i % 6 === 0;
  const r1 = 204;
  const r2 = isMajor ? 194 : 199;
  const x1 = (CX + r1 * Math.cos(angle)).toFixed(2);
  const y1 = (CY + r1 * Math.sin(angle)).toFixed(2);
  const x2 = (CX + r2 * Math.cos(angle)).toFixed(2);
  const y2 = (CY + r2 * Math.sin(angle)).toFixed(2);
  return {
    id: i,
    x1,
    y1,
    x2,
    y2,
    strokeWidth: isMajor ? "1" : "0.5",
    opacity: isMajor ? 0.55 : 0.25,
  };
});

export function AstrolabeStar({ className, size = 480 }: AstrolabeStarProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center pointer-events-none select-none",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full astrolabe-rotate opacity-75"
      >
        {/* Outer concentric rings */}
        <circle
          cx={CX}
          cy={CY}
          r={230}
          stroke="#F3D3A2"
          strokeWidth="1"
          strokeDasharray="3 6"
          opacity="0.35"
        />
        <circle
          cx={CX}
          cy={CY}
          r={210}
          stroke="#F3D3A2"
          strokeWidth="1"
          opacity="0.4"
        />
        <circle
          cx={CX}
          cy={CY}
          r={204}
          stroke="#F3D3A2"
          strokeWidth="0.75"
          opacity="0.3"
        />

        {/* Coordinate tick marks around perimeter (deterministic fixed precision) */}
        {TICKS.map((tick) => (
          <line
            key={tick.id}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#F3D3A2"
            strokeWidth={tick.strokeWidth}
            opacity={tick.opacity}
          />
        ))}

        {/* 12-point compass star polygon */}
        <polygon
          points={STAR_POINTS}
          stroke="#F3D3A2"
          strokeWidth="1.2"
          fill="none"
          opacity="0.7"
        />

        {/* Secondary inner ring */}
        <circle
          cx={CX}
          cy={CY}
          r={MID_R}
          stroke="#F3D3A2"
          strokeWidth="0.8"
          strokeDasharray="4 4"
          opacity="0.4"
        />

        {/* Inner circle & core star hub */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER_R}
          stroke="#F3D3A2"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle
          cx={CX}
          cy={CY}
          r={18}
          stroke="#F3D3A2"
          strokeWidth="1"
          opacity="0.6"
        />
        <circle
          cx={CX}
          cy={CY}
          r={4}
          fill="#F3D3A2"
          opacity="0.8"
        />

        {/* Diagonal and cardinal hairline axis lines */}
        <line
          x1={CX}
          y1={CY - 225}
          x2={CX}
          y2={CY + 225}
          stroke="#F3D3A2"
          strokeWidth="0.75"
          opacity="0.25"
        />
        <line
          x1={CX - 225}
          y1={CY}
          x2={CX + 225}
          y2={CY}
          stroke="#F3D3A2"
          strokeWidth="0.75"
          opacity="0.25"
        />
      </svg>
    </div>
  );
}
