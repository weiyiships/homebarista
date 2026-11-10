"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
 * and milk ONLY for milk drinks. Wires "Place Order" button to POST /api/orders,
 * handles loading, toast errors, and redirection to /order/[id].
 */
export function CustomizationDrawer({
  drink,
  isOpen,
  onClose,
  onAddToOrder,
}: CustomizationDrawerProps) {
  const router = useRouter();

  const [guestName, setGuestName] = useState<string>("");
  const [temp, setTemp] = useState<string>("");
  const [sizing, setSizing] = useState<string>("");
  const [milk, setMilk] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [toastError, setToastError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Reset state whenever the active drink changes or drawer opens
  useEffect(() => {
    if (drink) {
      setTemp("");
      setSizing("");
      setMilk("");
      setErrors([]);
      setToastError(null);
      setIsLoading(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!drink || isLoading) return;

    const validationErrors: string[] = [];

    if (!guestName.trim()) {
      validationErrors.push("Your name is required.");
    }

    const selection = {
      temp: temp || undefined,
      sizing: sizing || undefined,
      milk: milk || undefined,
    };

    const drinkValidation = validateCustomization(drink, selection);
    if (!drinkValidation.valid) {
      validationErrors.push(...drinkValidation.errors);
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setToastError(null);
    setIsLoading(true);

    try {
      const orderPayload = {
        guest_name: guestName.trim(),
        drink_id: drink.id,
        options: {
          temp,
          sizing,
          ...(drink.takesMilk && milk ? { milk } : {}),
        },
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as {
          error?: string;
          errors?: string[];
        } | null;

        const errorMsg =
          errorData?.error ||
          errorData?.errors?.join(", ") ||
          "Failed to place order. Please try again.";
        setToastError(errorMsg);
        return;
      }

      const data = (await response.json()) as { id: string };

      onAddToOrder?.({
        temp,
        sizing,
        ...(drink.takesMilk && milk ? { milk } : {}),
      });

      onClose();
      router.push(`/order/${data.id}`);
    } catch {
      setToastError(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Toast notification for errors */}
      {toastError && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed right-4 bottom-4 z-50 flex max-w-sm items-center gap-3 rounded-[6px] border border-[var(--status-cancelled)] bg-white p-4 text-sm text-[var(--status-cancelled)] shadow-lg dark:bg-stone-900"
        >
          <span className="flex-1">{toastError}</span>
          <button
            type="button"
            onClick={() => setToastError(null)}
            aria-label="Dismiss error"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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

          {/* Guest Name input */}
          <div className="space-y-2">
            <label
              htmlFor="guest-name"
              className="text-sm font-semibold text-[var(--foreground)]"
            >
              Your Name
            </label>
            <input
              id="guest-name"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full rounded-[6px] border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none dark:bg-stone-900"
            />
          </div>

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
              disabled={isLoading}
              className="w-full rounded-[6px] bg-[var(--primary)] px-5 py-3 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
