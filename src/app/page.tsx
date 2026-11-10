import Link from "next/link";
import { ClipboardList, Coffee, UserPlus } from "lucide-react";
import { DrinkIllustration } from "@/components/menu/DrinkIllustration";
import { PAGE_WIDE } from "@/components/site/layout";
import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none";

const STEPS = [
  {
    title: "Pick your drink",
    body: "Scan the QR code, choose a coffee, and set temperature, size, and milk.",
  },
  {
    title: "Watch it brew",
    body: "Your status page updates live from received to brewing to ready.",
  },
  {
    title: "Grab it at the bar",
    body: "The host works a first-come, first-served queue, so no order gets lost.",
  },
];

/** Landing page (#42). */
export default function HomePage() {
  return (
    <main className="flex flex-col">
      <section className="border-b border-[var(--border)] bg-[var(--muted)]">
        <div
          className={cn(
            PAGE_WIDE,
            "grid items-center gap-10 py-12 md:grid-cols-2 md:py-20",
          )}
        >
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl leading-tight font-bold tracking-tight text-[var(--foreground)] md:text-6xl">
              Home Barista
            </h1>
            <p className="max-w-md text-lg text-[var(--muted-foreground)]">
              Order freshly crafted coffee from your phone, or run the live
              barista queue for your gathering.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className={cn(
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] bg-[var(--primary)] px-6 py-3 font-semibold text-[var(--primary-foreground)] hover:opacity-90",
                  focusRing,
                )}
              >
                <Coffee className="h-5 w-5" aria-hidden="true" />
                Order Coffee
              </Link>
              <Link
                href="/barista"
                className={cn(
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] border border-[var(--foreground)] bg-[var(--background)] px-6 py-3 font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]",
                  focusRing,
                )}
              >
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
                Barista Queue
              </Link>
            </div>
            <Link
              href="/signup"
              className={cn(
                "inline-flex items-center gap-1.5 self-start rounded-[6px] text-sm text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--foreground)] hover:underline",
                focusRing,
              )}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Create an account to save your name and order history
            </Link>
          </div>
          <div
            aria-hidden="true"
            className="grid grid-cols-3 gap-4 text-[var(--foreground)]"
          >
            {[
              "Espresso",
              "Latte",
              "Cappuccino",
              "Americano",
              "Flat White",
              "Mocha",
            ].map((name) => (
              <div
                key={name}
                className="flex aspect-square items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--background)]"
              >
                <DrinkIllustration name={name} className="h-3/4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how-it-works"
        className={cn(PAGE_WIDE, "py-12 md:py-16")}
      >
        <h2
          id="how-it-works"
          className="text-2xl font-semibold text-[var(--foreground)]"
        >
          How it works
        </h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-2 rounded-[12px] border border-[var(--border)] p-6"
            >
              <span className="text-sm font-semibold text-[var(--muted-foreground)] tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {step.title}
              </h3>
              <p className="text-[var(--muted-foreground)]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
