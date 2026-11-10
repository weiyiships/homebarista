"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QueueResponseSchema } from "@/lib/schemas/barista";
import type { OrderStatus } from "@/lib/schemas/order";
import { toQueueOrder, type QueueOrder } from "./queueOrder";

export type { QueueOrder } from "./queueOrder";

export const QUEUE_POLL_INTERVAL_MS = 2500;
const CLOCK_TICK_MS = 1000;
const LOGIN_REDIRECT = `/barista/login?next=${encodeURIComponent("/barista")}`;

/**
 * Keeps the barista queue fresh by polling GET /api/barista/queue every
 * 2.5 s (FR-2: new orders visible within 3 s) and ticks a clock for the
 * "time waiting" label.
 */
export function useQueuePolling(
  initialOrders: QueueOrder[],
  initiallyOffline = false,
) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [orders, setOrders] = useState<QueueOrder[]>(initialOrders);
  const [connectionLost, setConnectionLost] = useState(initiallyOffline);
  const [now, setNow] = useState(() => new Date());
  // Bumped on every local change so a poll that started earlier cannot
  // overwrite a status the barista just set.
  const localVersion = useRef(0);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;

    async function poll() {
      if (inFlight.current) return;
      inFlight.current = true;
      const startedAt = localVersion.current;
      try {
        const response = await fetch("/api/barista/queue", {
          cache: "no-store",
        });
        if (!active) return;
        if (response.status === 401) {
          routerRef.current.replace(LOGIN_REDIRECT);
          return;
        }
        const parsed = QueueResponseSchema.safeParse(
          response.ok ? await response.json() : null,
        );
        if (!active) return;
        if (!parsed.success) {
          setConnectionLost(true);
          return;
        }
        setConnectionLost(false);
        if (startedAt === localVersion.current) {
          setOrders(parsed.data.orders.map(toQueueOrder));
        }
      } catch {
        if (active) setConnectionLost(true);
      } finally {
        inFlight.current = false;
      }
    }

    const pollTimer = setInterval(() => void poll(), QUEUE_POLL_INTERVAL_MS);
    const clockTimer = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => {
      active = false;
      clearInterval(pollTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const applyStatusChange = useCallback(
    (orderId: string, status: OrderStatus) => {
      localVersion.current += 1;
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
    },
    [],
  );

  return { orders, now, connectionLost, applyStatusChange };
}
