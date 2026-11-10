"use client";

import { useEffect, useRef, useState } from "react";
import { fromMenuDrinkDto } from "@/lib/domain/availability";
import type { Drink } from "@/lib/domain/menu";
import { MenuResponseSchema } from "@/lib/schemas/availability";

export const MENU_POLL_INTERVAL_MS = 2500;

export interface LiveMenu {
  drinks: Drink[];
  unavailableMilks: string[];
}

/**
 * Keeps the guest menu in step with the barista's availability toggles by
 * polling GET /api/menu every 2.5 s (FR-5). A failed or malformed poll keeps
 * the last good menu; the server still rejects stale orders.
 */
export function useMenuPolling(initial: LiveMenu): LiveMenu {
  const [menu, setMenu] = useState<LiveMenu>(initial);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;

    async function poll() {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const response = await fetch("/api/menu", { cache: "no-store" });
        const parsed = MenuResponseSchema.safeParse(
          response.ok ? await response.json() : null,
        );
        if (!active || !parsed.success) return;
        setMenu({
          drinks: parsed.data.drinks.map(fromMenuDrinkDto),
          unavailableMilks: parsed.data.unavailable_milks,
        });
      } catch {
        // Keep showing the last good menu; the next poll retries.
      } finally {
        inFlight.current = false;
      }
    }

    const timer = setInterval(() => void poll(), MENU_POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return menu;
}
