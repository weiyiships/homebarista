import React from "react";
import { Coffee, ChevronRight } from "lucide-react";
import type { Drink } from "@/lib/domain/drink-rules";

interface DrinkCardProps {
  drink: Drink;
  onSelect: (drink: Drink) => void;
}

export function DrinkCard({ drink, onSelect }: DrinkCardProps) {
  const isAvailable = drink.available;

  return (
    <button
      type="button"
      aria-label={drink.name}
      disabled={!isAvailable}
      onClick={() => isAvailable && onSelect(drink)}
      aria-disabled={!isAvailable}
      className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-4 min-h-[56px] ${
        isAvailable
          ? "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/40 cursor-pointer shadow-xs active:scale-[0.99]"
          : "border-[var(--border)]/60 bg-[var(--muted)]/40 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
            isAvailable
              ? "bg-[var(--muted)] text-[var(--primary)]"
              : "bg-[var(--muted)]/50 text-[var(--muted-foreground)]"
          }`}
        >
          <Coffee className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-[var(--foreground)] leading-snug">
              {drink.name}
            </h3>
            {!isAvailable && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                Unavailable
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
            {drink.description}
          </p>
        </div>
      </div>

      {isAvailable && (
        <div className="text-[var(--muted-foreground)] shrink-0 pl-1">
          <ChevronRight className="w-5 h-5" />
        </div>
      )}
    </button>
  );
}
