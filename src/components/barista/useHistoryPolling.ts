"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HistoryResponseSchema } from "@/lib/schemas/barista";
import { toHistoryOrder, type HistoryOrder } from "./historyOrder";
import { QUEUE_POLL_INTERVAL_MS } from "./useQueuePolling";

const LOGIN_REDIRECT = `/barista/login?next=${encodeURIComponent("/barista/history")}`;

/**
 * Keeps the barista history fresh by polling GET /api/barista/history at the
 * same 2.5 s cadence as the queue, so orders show up here soon after they
 * are picked up or cancelled (FR-6).
 */
export function useHistoryPolling(
  initialOrders: HistoryOrder[],
  initiallyOffline = false,
) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [orders, setOrders] = useState<HistoryOrder[]>(initialOrders);
  const [connectionLost, setConnectionLost] = useState(initiallyOffline);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;

    async function poll() {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const response = await fetch("/api/barista/history", {
          cache: "no-store",
        });
        if (!active) return;
        if (response.status === 401) {
          routerRef.current.replace(LOGIN_REDIRECT);
          return;
        }
        const parsed = HistoryResponseSchema.safeParse(
          response.ok ? await response.json() : null,
        );
        if (!active) return;
        if (!parsed.success) {
          setConnectionLost(true);
          return;
        }
        setConnectionLost(false);
        setOrders(parsed.data.orders.map(toHistoryOrder));
      } catch {
        if (active) setConnectionLost(true);
      } finally {
        inFlight.current = false;
      }
    }

    const timer = setInterval(() => void poll(), QUEUE_POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { orders, connectionLost };
}
