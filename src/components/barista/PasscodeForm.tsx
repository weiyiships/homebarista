"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";

export interface PasscodeFormProps {
  /** Barista page to open after signing in. */
  next: string;
}

const DEFAULT_DESTINATION = "/barista";

/** Only same-site barista pages are allowed as a return target. */
function safeDestination(next: string): string {
  return next === DEFAULT_DESTINATION || next.startsWith("/barista/")
    ? next
    : DEFAULT_DESTINATION;
}

/** Shared-passcode sign-in for the barista area (FR-3). */
export function PasscodeForm({ next }: PasscodeFormProps) {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (passcode === "") {
      setError("Enter the passcode.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/barista/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (response.ok) {
        router.replace(safeDestination(next));
        router.refresh();
        return;
      }
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Could not sign in. Please try again.");
      setPasscode("");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--foreground)]"
        >
          Barista passcode
        </label>
        <input
          id={inputId}
          type="password"
          autoComplete="current-password"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          className="min-h-11 rounded-[6px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-base text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none"
        />
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-[var(--status-cancelled)]"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-[var(--primary)] px-5 py-3 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Checking…
          </>
        ) : (
          <>
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Unlock queue
          </>
        )}
      </button>
    </form>
  );
}
