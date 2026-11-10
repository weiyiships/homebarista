"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

/** Clears the customer session and returns to the menu (US-11). */
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function logOut() {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch("/api/customers/session", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("logout failed");
      router.replace("/menu");
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void logOut()}
        disabled={pending}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-2.5 text-sm font-medium whitespace-nowrap text-[var(--primary)] hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden="true" />
        )}
        Log out
      </button>
      {failed && (
        <span role="alert" className="text-sm text-[var(--status-cancelled)]">
          Couldn’t log out. Try again.
        </span>
      )}
    </span>
  );
}
