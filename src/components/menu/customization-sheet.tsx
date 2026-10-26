"use client";

import React, { useState, useEffect } from "react";
import { X, Flame, Snowflake, Check } from "lucide-react";
import {
  type MenuItemDefinition,
  type DrinkCustomization,
  type SizeOption,
  type ShotOption,
  type MilkOption,
  type TemperatureOption,
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
  onConfirm: (drink: MenuItemDefinition, customization: DrinkCustomization) => void;
}

export function CustomizationSheet({
  drink,
  isOpen,
  onClose,
  onConfirm,
}: CustomizationSheetProps) {
  const [selectedSize, setSelectedSize] = useState<SizeOption>("medium");
  const [selectedShot, setSelectedShot] = useState<ShotOption>("single");
  const [selectedMilk, setSelectedMilk] = useState<MilkOption>("whole");
  const [selectedTemp, setSelectedTemp] = useState<TemperatureOption>("hot");

  // Reset or apply default customizations whenever a new drink is opened
  useEffect(() => {
    if (drink) {
      const defaults = getDefaultCustomization(drink);
      if (defaults.size) setSelectedSize(defaults.size);
      if (defaults.shot) setSelectedShot(defaults.shot);
      if (defaults.milk) setSelectedMilk(defaults.milk);
      if (defaults.temperature) setSelectedTemp(defaults.temperature);
    }
  }, [drink]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !drink) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customization: DrinkCustomization = {
      temperature: selectedTemp,
      ...(drink.sizeType === "shots" ? { shot: selectedShot } : { size: selectedSize }),
      ...(drink.takesMilk ? { milk: selectedMilk } : {}),
    };
    onConfirm(drink, customization);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customization-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full max-w-md bg-[var(--background)] rounded-t-3xl sm:rounded-3xl border border-[var(--border)] shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 id="customization-title" className="text-xl font-bold text-[var(--foreground)]">
              Customize {drink.name}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Select your preferences below
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 -mr-2 rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Options */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Size or Shots Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[var(--foreground)] block">
              {drink.sizeType === "shots" ? "Shots Selection" : "Size"}
            </label>
            <div
              role="radiogroup"
              aria-label={drink.sizeType === "shots" ? "Shots" : "Size"}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
            >
              {drink.sizeType === "shots"
                ? SHOT_OPTIONS.map((shot) => {
                    const isSelected = selectedShot === shot.value;
                    return (
                      <button
                        key={shot.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedShot(shot.value)}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition min-h-[48px]",
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)] font-semibold shadow-xs"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
                        )}
                      >
                        <span>{shot.label}</span>
                        {isSelected && <Check className="w-4 h-4 ml-1.5 shrink-0" />}
                      </button>
                    );
                  })
                : SIZE_OPTIONS.map((size) => {
                    const isSelected = selectedSize === size.value;
                    return (
                      <button
                        key={size.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedSize(size.value)}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition min-h-[48px]",
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)] font-semibold shadow-xs"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
                        )}
                      >
                        <span>{size.label}</span>
                        {isSelected && <Check className="w-4 h-4 ml-1.5 shrink-0" />}
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* Temperature Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[var(--foreground)] block">
              Temperature
            </label>
            <div
              role="radiogroup"
              aria-label="Temperature"
              className="grid grid-cols-2 gap-2.5"
            >
              {TEMPERATURE_OPTIONS.map((temp) => {
                const isSelected = selectedTemp === temp.value;
                const isHot = temp.value === "hot";
                return (
                  <button
                    key={temp.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedTemp(temp.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition min-h-[48px]",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)] font-semibold shadow-xs"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
                    )}
                  >
                    {isHot ? (
                      <Flame className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Snowflake className="w-4 h-4 text-sky-500" />
                    )}
                    <span>{temp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Milk Selection (Offered only if drink takes milk per PRD FR-1) */}
          {drink.takesMilk && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[var(--foreground)] block">
                Milk Choice
              </label>
              <div
                role="radiogroup"
                aria-label="Milk Choice"
                className="grid grid-cols-2 gap-2.5"
              >
                {MILK_OPTIONS.map((milk) => {
                  const isSelected = selectedMilk === milk.value;
                  return (
                    <button
                      key={milk.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedMilk(milk.value)}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition min-h-[48px]",
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)] font-semibold shadow-xs"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
                      )}
                    >
                      <span>{milk.label}</span>
                      {isSelected && <Check className="w-4 h-4 ml-1.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] font-medium text-sm hover:opacity-90 transition min-h-[48px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-sm shadow hover:opacity-95 transition min-h-[48px]"
            >
              Add to Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
