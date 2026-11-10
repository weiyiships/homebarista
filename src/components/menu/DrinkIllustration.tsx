import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Original line drawings of the six menu drinks (#40). Monochrome: drawn in
 * `currentColor` with tints, so they follow the light and dark theme.
 * Decorative only; the drink name is always in the surrounding text.
 */

const STEAM = (
  <path
    d="M50 14c-4 5 4 8 0 13M60 10c-4 5 4 8 0 13M70 14c-4 5 4 8 0 13"
    strokeWidth={3}
  />
);

const DRAWINGS: Record<string, ReactNode> = {
  Espresso: (
    <>
      {STEAM}
      <path d="M38 50h44l-5 30a8 8 0 0 1-8 7H51a8 8 0 0 1-8-7z" />
      <path d="M41 56h38" />
      <path d="M40 54h40l-1 6H41z" fill="currentColor" opacity={0.85} />
      <path d="M82 58h6a7 7 0 0 1 0 14h-8" />
      <ellipse cx={60} cy={92} rx={34} ry={6} />
    </>
  ),
  Americano: (
    <>
      {STEAM}
      <rect x={36} y={36} width={44} height={60} rx={6} />
      <path
        d="M40 46h36v44a4 4 0 0 1-4 4H44a4 4 0 0 1-4-4z"
        fill="currentColor"
        opacity={0.85}
      />
      <path d="M80 48h8a10 10 0 0 1 0 20h-8" />
    </>
  ),
  Latte: (
    <>
      <path d="M40 22h40l-6 76H46z" />
      <path d="M45 72h30l-2 26H47z" fill="currentColor" opacity={0.85} />
      <path d="M43 46h34l-2 26H45z" fill="currentColor" opacity={0.3} />
      <path d="M42 30h36l-1 16H43z" fill="currentColor" opacity={0.08} />
      <path d="M43 46h34M45 72h30" />
    </>
  ),
  Cappuccino: (
    <>
      <path d="M34 58h52l-6 28a8 8 0 0 1-8 6H48a8 8 0 0 1-8-6z" />
      <path
        d="M34 58c0-14 12-24 26-24s26 10 26 24z"
        fill="currentColor"
        opacity={0.1}
      />
      <path d="M34 58c0-14 12-24 26-24s26 10 26 24" />
      <circle cx={52} cy={48} r={1.8} fill="currentColor" />
      <circle cx={61} cy={44} r={1.8} fill="currentColor" />
      <circle cx={69} cy={50} r={1.8} fill="currentColor" />
      <path d="M86 64h5a7 7 0 0 1 0 14h-7" />
      <ellipse cx={60} cy={98} rx={36} ry={5} />
    </>
  ),
  "Flat White": (
    <>
      <ellipse cx={60} cy={56} rx={34} ry={14} />
      <ellipse
        cx={60}
        cy={56}
        rx={28}
        ry={10}
        fill="currentColor"
        opacity={0.75}
      />
      <path
        d="M60 64c-9-5-12-9-10-12 2-3 7-2 10 2 3-4 8-5 10-2 2 3-1 7-10 12z"
        fill="var(--background, #fff)"
        stroke="none"
      />
      <path d="M26 56l6 26a10 10 0 0 0 10 8h36a10 10 0 0 0 10-8l6-26" />
      <path d="M94 60h4a7 7 0 0 1 0 14h-7" />
      <ellipse cx={60} cy={98} rx={38} ry={5} />
    </>
  ),
  Mocha: (
    <>
      <path d="M40 34h40l-6 64H46z" />
      <path d="M43 52h34l-4 46H47z" fill="currentColor" opacity={0.85} />
      <path
        d="M40 34c2-12 10-16 20-16s18 4 20 16z"
        fill="currentColor"
        opacity={0.1}
      />
      <path d="M40 34c2-12 10-16 20-16s18 4 20 16" />
      <path d="M44 40l8 6 8-6 8 6 8-6" strokeWidth={3} />
    </>
  ),
};

const GENERIC = (
  <>
    {STEAM}
    <path d="M36 40h48l-6 52H42z" />
    <path d="M38 52h44" />
  </>
);

export interface DrinkIllustrationProps {
  name: string;
  className?: string;
}

export function DrinkIllustration({ name, className }: DrinkIllustrationProps) {
  const drawing = DRAWINGS[name];
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      data-drink={drawing ? name : "generic"}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-[var(--foreground)]", className)}
    >
      {drawing ?? GENERIC}
    </svg>
  );
}
