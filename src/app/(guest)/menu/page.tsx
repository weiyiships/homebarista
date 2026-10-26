"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Coffee, ArrowLeft, User } from "lucide-react";
import {
  STANDARD_DRINKS,
  type MenuItemDefinition,
  type DrinkCustomization,
} from "@/lib/domain/drink-rules";
import { DrinkCard } from "@/components/menu/drink-card";
import { CustomizationSheet } from "@/components/menu/customization-sheet";

/**
 * MenuPage: Displays standard coffee drinks catalog and customization drawer.
 * Satisfies PRD FR-1 and Issue #3 Acceptance Criteria.
 */
export default function MenuPage() {
  const [selectedDrink, setSelectedDrink] = useState<MenuItemDefinition | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  function handleSelectDrink(drink: MenuItemDefinition) {
    setSelectedDrink(drink);
    setIsSheetOpen(true);
  }

  function handleCloseSheet() {
    setIsSheetOpen(false);
  }

  function handleConfirmCustomization(
    drink: MenuItemDefinition,
    _customization: DrinkCustomization
  ) {
    // In Issue #5, this will submit the order and redirect to /order/[id]
    setIsSheetOpen(false);
  }

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Top Navigation */}
      <header className="flex items-center justify-between pt-2 pb-1 border-b border-[var(--border)]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition min-h-[44px]"
        >
          <User className="w-4 h-4" />
          <span>Log in</span>
        </Link>
      </header>

      {/* Hero Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-xs tracking-wider uppercase">
          <Coffee className="w-4 h-4" />
          <span>Handcrafted Coffee</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Coffee Menu
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Tap any available drink to customize your shot or size.
        </p>
      </div>

      {/* Drink Cards List */}
      <main className="flex-1 space-y-3 pb-8">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1 font-medium">
          <span>Standard Drinks</span>
          <span>{STANDARD_DRINKS.length} options</span>
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

      {/* Customization Drawer / Modal */}
      <CustomizationSheet
        drink={selectedDrink}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        onConfirm={handleConfirmCustomization}
      />
    </div>
  );
}
