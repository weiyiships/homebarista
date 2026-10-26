"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { STANDARD_DRINKS, type Drink } from "@/lib/domain/drink-rules";
import { DrinkCard } from "@/components/menu/drink-card";
import { CustomizationSheet } from "@/components/menu/customization-sheet";

export default function MenuPage() {
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-8">
      {/* Top Navigation */}
      <header className="flex items-center justify-between pt-2 pb-1 border-b border-[var(--border)]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition min-h-[44px] -ml-2 px-2"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition min-h-[44px] -mr-2 px-2"
        >
          <User className="w-3.5 h-3.5" />
          <span>Log in</span>
        </Link>
      </header>

      {/* Menu Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Menu
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Select a freshly crafted drink to customize your order.
        </p>
      </div>

      {/* Drinks Catalog */}
      <section aria-label="Available drinks" className="space-y-3">
        {STANDARD_DRINKS.map((drink) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            onSelect={(selected) => setSelectedDrink(selected)}
          />
        ))}
      </section>

      {/* Customization Drawer / Modal */}
      <CustomizationSheet
        isOpen={Boolean(selectedDrink)}
        drink={selectedDrink}
        onClose={() => setSelectedDrink(null)}
      />
    </div>
  );
}
