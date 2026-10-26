import React from "react";
import { Coffee, ChevronRight, Ban } from "lucide-react";
import type { MenuItemDefinition } from "@/lib/domain/drink-rules";
import { cn } from "@/lib/utils";

interface DrinkCardProps {
  drink: MenuItemDefinition;
  onSelect: (drink: MenuItemDefinition) => void;
  className?: string;
}

/**
 * DrinkCard: Displays a coffee menu item.
 * Tapping opens the customization sheet/modal (PRD FR-1).
 * Disabled with an "Unavailable" label when drink is off.
 */
export function DrinkCard({ drink, onSelect, className }: DrinkCardProps) {
  const isAvailable = drink.available;

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => isAvailable && onSelect(drink)}
      aria-disabled={!isAvailable}
      aria-label={`${drink.name}${!isAvailable ? " (Unavailable)" : ""}`}
      className={cn(
        "w-full text-left p-4 rounded-2xl border transition flex items-center justify-between gap-3 min-h-[72px]",
        isAvailable
          ? "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:shadow-sm active:scale-[0.99] cursor-pointer"
          : "border-[var(--border)] bg-[var(--muted)] opacity-60 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
            isAvailable
              ? "bg-[var(--muted)] text-[var(--primary)]"
              : "bg-[var(--border)] text-[var(--muted-foreground)]"
          )}
        >
          {isAvailable ? <Coffee className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-[var(--foreground)] leading-tight">
              {drink.name}
            </h3>
            {!isAvailable && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--status-cancelled)] text-white font-medium">
                Unavailable
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
            {drink.description}
          </p>
          <div className="text-[11px] font-medium text-[var(--accent)] pt-0.5">
            {drink.sizeType === "shots" ? "Single / Double shot" : "Small / Medium / Large"}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-[var(--muted-foreground)]">
        {isAvailable && <ChevronRight className="w-5 h-5" />}
      </div>
    </button>
  );
}
