import { Coffee } from "lucide-react";
import { PasscodeForm } from "@/components/barista/PasscodeForm";
import { PAGE_FORM } from "@/components/site/layout";
import { cn } from "@/lib/utils";

interface BaristaLoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

/** /barista/login — shared-passcode gate for the barista area (FR-3). */
export default async function BaristaLoginPage({
  searchParams,
}: BaristaLoginPageProps) {
  const { next } = await searchParams;
  const destination = typeof next === "string" ? next : "/barista";

  return (
    <main
      className={cn(PAGE_FORM, "flex flex-1 flex-col justify-center py-12")}
    >
      <div className="flex flex-col gap-6 rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-6">
        <div className="flex flex-col gap-2">
          <Coffee
            className="h-8 w-8 text-[var(--primary)]"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Barista sign in
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Enter the host passcode to open the live order queue.
          </p>
        </div>
        <PasscodeForm next={destination} />
      </div>
    </main>
  );
}
