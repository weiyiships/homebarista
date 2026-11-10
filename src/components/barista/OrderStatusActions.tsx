"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Loader2, X } from "lucide-react";
import {
  isActiveStatus,
  nextActionLabel,
  type StatusAction,
} from "@/lib/domain/orderStatus";
import { OrderStatusEnum, type OrderStatus } from "@/lib/schemas/order";
import { cn } from "@/lib/utils";

export interface OrderStatusActionsProps {
  orderId: string;
  guestName: string;
  status: OrderStatus;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-5 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const primaryButton = cn(
  buttonBase,
  "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]",
);

const secondaryButton = cn(
  buttonBase,
  "border border-[var(--border)] bg-[var(--background)] text-[var(--primary)] hover:bg-[var(--muted)]",
);

const destructiveButton = cn(
  buttonBase,
  "bg-[var(--status-cancelled)] text-white hover:opacity-90",
);

async function requestStatusChange(
  orderId: string,
  action: StatusAction,
): Promise<{ ok: true; status: OrderStatus } | { ok: false; error: string }> {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = (await response.json().catch(() => null)) as {
      status?: unknown;
      error?: string;
      errors?: string[];
    } | null;

    if (!response.ok) {
      return {
        ok: false,
        error:
          data?.error ??
          data?.errors?.join(", ") ??
          "Could not update the order. Please try again.",
      };
    }

    const parsed = OrderStatusEnum.safeParse(data?.status);
    if (!parsed.success) {
      return { ok: false, error: "Unexpected response from the server." };
    }
    return { ok: true, status: parsed.data };
  } catch {
    return {
      ok: false,
      error: "Network error. Check your connection and try again.",
    };
  }
}

/**
 * One-tap advance button plus a confirmed cancel for a barista order card
 * (FR-3, US-4). Renders nothing for finished orders.
 */
export function OrderStatusActions({
  orderId,
  guestName,
  status,
  onStatusChange,
}: OrderStatusActionsProps) {
  const [pending, setPending] = useState<StatusAction | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keepButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (confirming) keepButtonRef.current?.focus();
  }, [confirming]);

  if (!isActiveStatus(status)) {
    return null;
  }

  const advanceLabel = nextActionLabel(status);
  const isBusy = pending !== null;

  async function run(action: StatusAction) {
    if (isBusy) return;
    setPending(action);
    setError(null);
    const result = await requestStatusChange(orderId, action);
    setPending(null);
    setConfirming(false);
    if (result.ok) {
      onStatusChange(orderId, result.status);
    } else {
      setError(result.error);
    }
  }

  function closeConfirm() {
    setConfirming(false);
    cancelButtonRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <button
          type="button"
          className={cn(primaryButton, "flex-1")}
          disabled={isBusy}
          onClick={() => void run("advance")}
        >
          {pending === "advance" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Updating…
            </>
          ) : (
            <>
              {advanceLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
        <button
          ref={cancelButtonRef}
          type="button"
          className={secondaryButton}
          disabled={isBusy || confirming}
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
        >
          Cancel
        </button>
      </div>

      {confirming && (
        <div
          role="alertdialog"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !isBusy) closeConfirm();
          }}
          className="rounded-[6px] border border-[var(--status-cancelled)] bg-[var(--muted)] p-4"
        >
          <p
            id={titleId}
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            Cancel {guestName}’s order?
          </p>
          <p
            id={descriptionId}
            className="mt-1 text-sm text-[var(--muted-foreground)]"
          >
            It will leave the queue and the guest will see it as cancelled.
          </p>
          <div className="mt-3 flex gap-3">
            <button
              ref={keepButtonRef}
              type="button"
              className={cn(secondaryButton, "flex-1")}
              disabled={isBusy}
              onClick={closeConfirm}
            >
              Keep order
            </button>
            <button
              type="button"
              className={cn(destructiveButton, "flex-1")}
              disabled={isBusy}
              onClick={() => void run("cancel")}
            >
              {pending === "cancel" ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Cancelling…
                </>
              ) : (
                <>
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancel order
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="text-sm font-medium text-[var(--status-cancelled)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
