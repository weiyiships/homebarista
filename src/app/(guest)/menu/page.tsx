"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import {
  STANDARD_DRINKS,
  type MenuItemDefinition,
  type DrinkCustomization,
} from "@/lib/domain/drink-rules";
import { DrinkCard } from "@/components/menu/drink-card";
import { CustomizationSheet } from "@/components/menu/customization-sheet";

export default function MenuPage() {
  const [selectedDrink, setSelectedDrink] = useState<MenuItemDefinition | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [confirmedItem, setConfirmedItem] = useState<{
    drink: MenuItemDefinition;
    customization: DrinkCustomization;
  } | null>(null);

  const handleSelectDrink = (drink: MenuItemDefinition) => {
    setSelectedDrink(drink);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  const handleConfirmCustomization = (
    drink: MenuItemDefinition,
    customization: DrinkCustomization
  ) => {
    setConfirmedItem({ drink, customization });
    setIsSheetOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-md mx-auto w-full pb-8">
      {/* Top Navigation */}
      <header className="flex items-center justify-between pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition min-h-[44px] min-w-[44px]"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] bg-[var(--muted)] px-3 py-1 rounded-full">
          Live Menu
        </span>
      </header>

      {/* Hero Section */}
      <section className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Coffee Menu
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Select a freshly crafted drink to customize your order.
        </p>
      </section>

      {/* Confirmation Banner if item selected */}
      {confirmedItem && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-2xl bg-[var(--muted)] border border-[var(--primary)]/20 flex items-start gap-3 shadow-xs animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5 flex-1">
            <p className="font-semibold text-[var(--foreground)]">
              Selected: {confirmedItem.drink.name}
            </p>
            <p className="text-[var(--muted-foreground)]">
              {confirmedItem.customization.shot
                ? `${confirmedItem.customization.shot} shot`
                : confirmedItem.customization.size}
              {confirmedItem.customization.milk ? `, ${confirmedItem.customization.milk} milk` : ""}
              {`, ${confirmedItem.customization.temperature}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSelectDrink(confirmedItem.drink)}
            className="text-xs text-[var(--accent)] font-semibold underline underline-offset-2 shrink-0 py-1"
          >
            Edit
          </button>
        </div>
      )}

      {/* Drinks Catalog List */}
      <main className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)] px-1">
          <span>STANDARD DRINKS</span>
          <span className="flex items-center gap-1 text-[var(--accent)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>6 varieties</span>
          </span>
        </div>

        <div className="space-y-2.5">
          {STANDARD_DRINKS.map((drink) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              onSelect={handleSelectDrink}
            />
          ))}
        </div>
      </main>

      {/* Customization Sheet Modal */}
      <CustomizationSheet
        drink={selectedDrink}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        onConfirm={handleConfirmCustomization}
      />
    </div>
  );
}
