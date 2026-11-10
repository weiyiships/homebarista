"use client";

import { useSyncExternalStore } from "react";
import { formatClockTime } from "@/lib/domain/history";

const subscribe = () => () => {};

/**
 * Date and time in the viewer's time zone. Rendered only on the client, since
 * the server (UTC on Vercel) doesn't know the guest's zone.
 */
export function LocalTime({ value }: { value: string }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return <time dateTime={value}>{isClient ? formatClockTime(value) : ""}</time>;
}
