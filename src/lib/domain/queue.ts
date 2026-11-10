/**
 * Pure rules for the live barista queue (FR-3, US-3).
 */

type Timestamp = string | Date;

function toMillis(value: Timestamp): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

/** Returns a copy sorted by arrival time, oldest first (FIFO). Stable on ties. */
export function sortOldestFirst<T extends { createdAt: Timestamp }>(
  orders: readonly T[],
): T[] {
  return [...orders].sort(
    (a, b) => toMillis(a.createdAt) - toMillis(b.createdAt),
  );
}

/** Short "time waiting" label: `42s`, `3m 05s`, `1h 07m`. */
export function formatElapsed(createdAt: Timestamp, now: Date): string {
  const totalSeconds = Math.max(
    0,
    Math.floor((now.getTime() - toMillis(createdAt)) / 1000),
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) return `${hours}h ${pad(minutes)}m`;
  if (minutes > 0) return `${minutes}m ${pad(seconds)}s`;
  return `${seconds}s`;
}

export interface OrderOptions {
  /** Size (Small/Medium/Large) or shots (Single/Double). */
  sizing: string | null;
  milk: string | null;
  temp: string | null;
}

function readLabel(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : null;
}

/** Reads the stored `options_json` of an order item into known fields. */
export function parseOrderOptions(optionsJson: unknown): OrderOptions {
  if (
    typeof optionsJson !== "object" ||
    optionsJson === null ||
    Array.isArray(optionsJson)
  ) {
    return { sizing: null, milk: null, temp: null };
  }
  const source = optionsJson as Record<string, unknown>;
  return {
    sizing: readLabel(source, "sizing"),
    milk: readLabel(source, "milk"),
    temp: readLabel(source, "temp"),
  };
}

/** Display chips for a queue card, in barista prep order. */
export function describeOrderOptions(options: OrderOptions): string[] {
  return [
    options.sizing,
    options.milk ? `${options.milk} milk` : null,
    options.temp,
  ].filter((label): label is string => label !== null);
}
