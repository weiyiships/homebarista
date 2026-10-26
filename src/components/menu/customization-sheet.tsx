"use client";

import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import {
  type MenuItemDefinition,
  type DrinkCustomization,
  type ShotOption,
  type SizeOption,
  type TemperatureOption,
  type MilkOption,
  SHOT_OPTIONS,
  SIZE_OPTIONS,
  MILK_OPTIONS,
  TEMPERATURE_OPTIONS,
  getDefaultCustomization,
} from "@/lib/domain/drink-rules";
import { cn } from "@/lib/utils";

interface CustomizationSheetProps {
  drink: MenuItemDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (drink: MenuItemDefinition, customization: DrinkCustomization) => void;
}

/**
 * CustomizationSheet: Bottom drawer/modal for customizing drink options.
 * Shows Single/Double shot for Espresso, and Small/Medium/Large for other drinks (PRD FR-1, Issue #3).
 */
export function CustomizationSheet({
  drink,
  isOpen,
  onClose,
  onConfirm,
}: CustomizationSheetProps) {
  const [customization, setCustomization] = useState<DrinkCustomization | null>(null);

  // Initialize defaults whenever a drink opens
  useEffect(() => {
    if (drink && isOpen) {
      setCustomization(getDefaultCustomization(drink));
    }
  }, [drink, isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !drink || !customization) {
    return null;
  }

  const isEspressoDrink = drink.sizeType === "shots";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-[var(--background)] rounded-t-3xl border-t border-[var(--border)] p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="space-y-1">
            <h2 id="sheet-title" className="text-xl font-bold text-[var(--foreground)]">
              Customize {drink.name}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {drink.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Groups */}
        <div className="space-y-6">
          {/* Shots for Espresso */}
          {isEspressoDrink && (
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-[var(--foreground)] block">
                Shot Selection
              </label>
              <div
                role="radiogroup"
                aria-label="Shot Selection"
                className="grid grid-cols-2 gap-2.5"
              >
                {SHOT_OPTIONS.map((option) => {
                  const isChecked = customization.shot === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      onClick={() =>
                        setCustomization((prev) =>
                          prev ? { ...prev, shot: option.value as ShotOption } : null
                        )
                      }
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition min-h-[44px] cursor-pointer",
                        isChecked
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                          : "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
                      )}
                    >
                      <span>{option.label}</span>
                      {isChecked && <Check className="w-4 h-4 ml-1.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size for non-Espresso */}
          {!isEspressoDrink && (
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-[var(--foreground)] block">
                Size
              </label>
              <div
                role="radiogroup"
                aria-label="Size Selection"
                className="grid grid-cols-3 gap-2"
              >
                {SIZE_OPTIONS.map((option) => {
                  const isChecked = customization.size === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      onClick={() =>
                        setCustomization((prev) =>
                          prev ? { ...prev, size: option.value as SizeOption } : null
                        )
                      }
                      className={cn(
                        "flex items-center justify-center px-3 py-3 rounded-xl border text-sm font-medium transition min-h-[44px] cursor-pointer",
                        isChecked
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                          : "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
                      )}
                    >
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Temperature */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-[var(--foreground)] block">
              Temperature
            </label>
            <div
              role="radiogroup"
              aria-label="Temperature Selection"
              className="grid grid-cols-2 gap-2.5"
            >
              {TEMPERATURE_OPTIONS.map((option) => {
                const isChecked = customization.temperature === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isChecked}
                    onClick={() =>
                      setCustomization((prev) =>
                        prev
                          ? { ...prev, temperature: option.value as TemperatureOption }
                          : null
                      )
                    }
                    className={cn(
                      "flex items-center justify-center px-4 py-3 rounded-xl border text-sm font-medium transition min-h-[44px] cursor-pointer",
                      isChecked
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                        : "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
                    )}
                  >
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Milk Options (only for milk drinks) */}
          {drink.takesMilk && (
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-[var(--foreground)] block">
                Milk Choice
              </label>
              <div
                role="radiogroup"
                aria-label="Milk Selection"
                className="grid grid-cols-2 gap-2.5"
              >
                {MILK_OPTIONS.map((option) => {
                  const isChecked = customization.milk === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      onClick={() =>
                        setCustomization((prev) =>
                          prev ? { ...prev, milk: option.value as MilkOption } : null
                        )
                      }
                      className={cn(
                        "flex items-center justify-between px-3.5 py-3 rounded-xl border text-xs font-medium transition min-h-[44px] cursor-pointer",
                        isChecked
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                          : "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
                      )}
                    >
                      <span>{option.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 ml-1 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onConfirm?.(drink, customization)}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow hover:opacity-95 transition min-h-[44px] cursor-pointer"
          >
            Confirm Options
          </button>
        </div>
      </div>
    </div>
  );
}
