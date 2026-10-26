"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  type Drink,
  type ShotOptionId,
  type SizeOptionId,
  getSizeOrShotOptions,
  getDefaultSizeOrShot,
} from "@/lib/domain/drink-rules";

interface CustomizationSheetProps {
  isOpen: boolean;
  drink: Drink | null;
  onClose: () => void;
  selectedSizeOrShot?: ShotOptionId | SizeOptionId;
  onSelectSizeOrShot?: (option: ShotOptionId | SizeOptionId) => void;
}

export function CustomizationSheet({
  isOpen,
  drink,
  onClose,
  selectedSizeOrShot: externalSelected,
  onSelectSizeOrShot,
}: CustomizationSheetProps) {
  const [internalSelected, setInternalSelected] = useState<
    ShotOptionId | SizeOptionId | null
  >(null);

  // Set default selection when drink changes (PRD FR-1, AGENTS.md 2.3, #3)
  useEffect(() => {
    if (drink) {
      setInternalSelected(getDefaultSizeOrShot(drink.id));
    }
  }, [drink]);

  // Handle escape key to dismiss sheet
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !drink) {
    return null;
  }

  const selectedValue = externalSelected ?? internalSelected;
  const isShots = drink.sizeType === "shots";
  const options = getSizeOrShotOptions(drink.id);

  function handleSelect(optionId: ShotOptionId | SizeOptionId) {
    setInternalSelected(optionId);
    onSelectSizeOrShot?.(optionId);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customization-title"
    >
      {/* Backdrop */}
      <div
        data-testid="customization-sheet-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-md bg-[var(--background)] rounded-t-2xl sm:rounded-2xl border border-[var(--border)] shadow-2xl p-6 z-10 space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-2 border-b border-[var(--border)]">
          <div>
            <h2
              id="customization-title"
              className="text-xl font-bold text-[var(--foreground)] tracking-tight"
            >
              Customize {drink.name}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {drink.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close customization"
            className="p-2 -mr-2 rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Group: Shots or Size */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[var(--foreground)]">
            {isShots ? "Shots" : "Size"}
          </label>
          <div
            role="radiogroup"
            aria-label={isShots ? "Shots selection" : "Size selection"}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
          >
            {options.map((option) => {
              const isSelected = selectedValue === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(option.id)}
                  className={`min-h-[48px] px-3 py-2.5 rounded-xl border text-sm font-medium transition cursor-pointer flex items-center justify-center text-center ${
                    isSelected
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-xs"
                      : "bg-[var(--muted)]/50 text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
