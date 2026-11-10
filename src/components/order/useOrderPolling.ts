"use client";

import { useEffect, useState } from "react";
import { isActiveStatus } from "@/lib/domain/orderStatus";
import { OrderTrackingSchema, type OrderTracking } from "@/lib/schemas/order";

export const ORDER_POLL_INTERVAL_MS = 2500;

/**
 * Polls GET /api/orders/:id every 2.5 s (FR-4: updates within 3 s) until the
 * order is picked up or cancelled.
 */
export function useOrderPolling(initialOrder: OrderTracking) {
  const [order, setOrder] = useState(initialOrder);
  const [connectionLost, setConnectionLost] = useState(false);
  const finished = !isActiveStatus(order.status);
  const orderId = order.id;

  useEffect(() => {
    if (finished) return;
    let active = true;
    let inFlight = false;

    async function poll() {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          cache: "no-store",
        });
        const parsed = OrderTrackingSchema.safeParse(
          response.ok ? await response.json() : null,
        );
        if (!active) return;
        if (parsed.success) {
          setOrder(parsed.data);
          setConnectionLost(false);
        } else {
          setConnectionLost(true);
        }
      } catch {
        if (active) setConnectionLost(true);
      } finally {
        inFlight = false;
      }
    }

    const timer = setInterval(() => void poll(), ORDER_POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [orderId, finished]);

  return { order, connectionLost };
}
