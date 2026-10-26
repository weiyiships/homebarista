import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges class names with Tailwind CSS conflicts resolved.
 * Standard helper for shadcn/ui components (AGENTS.md Section 1.3).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
