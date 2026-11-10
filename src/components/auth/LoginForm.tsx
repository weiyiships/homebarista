"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { LoginSchema } from "@/lib/schemas/customer";
import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none";

const inputClass = cn(
  "min-h-11 rounded-[6px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-base text-[var(--foreground)]",
  focusRing,
);

const secondaryLink = cn(
  "inline-flex min-h-11 items-center justify-center rounded-[6px] border border-[var(--border)] bg-[var(--background)] px-5 py-3 text-sm font-medium text-[var(--primary)] hover:bg-[var(--muted)]",
  focusRing,
);

/** Customer login (FR-7, US-11). Errors stay generic on purpose. */
export function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Enter your email and password.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/customers/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (response.ok) {
        router.replace("/menu");
        router.refresh();
        return;
      }
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Could not log you in. Please try again.");
      setPassword("");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const describedBy = error ? errorId : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={emailId}
          className="text-sm font-medium text-[var(--foreground)]"
        >
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={describedBy}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor={passwordId}
          className="text-sm font-medium text-[var(--foreground)]"
        >
          Password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={describedBy}
          className={inputClass}
        />
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="rounded-[6px] border border-[var(--status-cancelled)] p-3 text-sm text-[var(--foreground)]"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-[var(--primary)] px-5 py-3 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60",
          focusRing,
        )}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Logging in…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Log in
          </>
        )}
      </button>

      <div className="flex flex-col gap-3">
        <Link href="/signup" className={secondaryLink}>
          Create an account
        </Link>
        <Link href="/menu" className={secondaryLink}>
          Continue as guest
        </Link>
      </div>
    </form>
  );
}
