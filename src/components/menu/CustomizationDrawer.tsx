"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  getDrinkOptions,
  validateCustomization,
  type Drink,
} from "@/lib/domain/menu";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CustomizationDrawerProps {
  drink: Drink | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToOrder?: (customization: {
    temp: string;
    sizing: string;
    milk?: string;
  }) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CustomizationDrawer — client component.
 *
 * Renders temperature (hot/iced always), size OR shots depending on drink type,
 * and milk ONLY for milk drinks. Validates selection before allowing "Add to order".
 * Matches DESIGN.md tokens and elevation rules.
 */
export function CustomizationDrawer({
  drink,
  isOpen,
  onClose,
  onAddToOrder,
}: CustomizationDrawerProps) {
  const [temp, setTemp] = useState<string>("");
  const [sizing, setSizing] = useState<string>("");
  const [milk, setMilk] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  // Reset state whenever the active drink changes or drawer opens
  useEffect(() => {
    if (drink) {
      setTemp("");
      setSizing("");
      setMilk("");
      setErrors([]);
    }
  }, [drink, isOpen]);

  // Handle Escape key to close the drawer
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !drink) {
    return null;
  }

  const options = getDrinkOptions(drink);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!drink) return;

    const selection = {
      temp: temp || undefined,
      sizing: sizing || undefined,
      milk: milk || undefined,
    };

    const result = validateCustomization(drink, selection);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors([]);
    onAddToOrder?.({
      temp,
      sizing,
      ...(drink.takesMilk && milk ? { milk } : {}),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[var(--border)] bg-[var(--background)] p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h2
              id="drawer-title"
              className="text-2xl font-bold text-[var(--foreground)]"
            >
              Customize {drink.name}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Choose your options below
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-[6px] p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-1 flex-col gap-6"
        >
          {/* Validation errors */}
          {errors.length > 0 && (
            <div
              role="alert"
              className="rounded-[6px] border border-[var(--status-cancelled)] bg-red-50 p-4 text-sm text-[var(--status-cancelled)] dark:bg-red-950/30"
            >
              <ul className="list-inside list-disc space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Temperature */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-[var(--foreground)]">
              Temperature
            </legend>
            <div
              className="flex gap-3"
              role="radiogroup"
              aria-label="Temperature"
            >
              {options.temp.map((opt) => {
                const isSelected = temp === opt.label;
                return (
                  <label
                    key={opt.label}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center justify-center rounded-[6px] border px-4 py-2.5 text-sm font-medium transition-colors",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--muted)] dark:bg-stone-900",
                    )}
                  >
                    <input
                      type="radio"
                      name="temperature"
                      value={opt.label}
                      checked={isSelected}
                      onChange={() => setTemp(opt.label)}
                      className="sr-only"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Size / Shots */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-[var(--foreground)]">
              {drink.sizeType === "size" ? "Size" : "Shots"}
            </legend>
            <div
              className="flex gap-3"
              role="radiogroup"
              aria-label={drink.sizeType === "size" ? "Size" : "Shots"}
            >
              {options.sizing.map((opt) => {
                const isSelected = sizing === opt.label;
                return (
                  <label
                    key={opt.label}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center justify-center rounded-[6px] border px-4 py-2.5 text-sm font-medium transition-colors",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--muted)] dark:bg-stone-900",
                    )}
                  >
                    <input
                      type="radio"
                      name="sizing"
                      value={opt.label}
                      checked={isSelected}
                      onChange={() => setSizing(opt.label)}
                      className="sr-only"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Milk Options (ONLY for milk drinks) */}
          {drink.takesMilk && options.milk.length > 0 && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-[var(--foreground)]">
                Milk Choice
              </legend>
              <div
                className="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-label="Milk Choice"
              >
                {options.milk.map((opt) => {
                  const isSelected = milk === opt.label;
                  return (
                    <label
                      key={opt.label}
                      className={cn(
                        "flex cursor-pointer items-center justify-center rounded-[6px] border px-4 py-2.5 text-sm font-medium transition-colors",
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--muted)] dark:bg-stone-900",
                      )}
                    >
                      <input
                        type="radio"
                        name="milk"
                        value={opt.label}
                        checked={isSelected}
                        onChange={() => setMilk(opt.label)}
                        className="sr-only"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {/* Action buttons */}
          <div className="mt-auto pt-6">
            <button
              type="submit"
              className="w-full rounded-[6px] bg-[var(--primary)] px-5 py-3 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
            >
              Add to order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
