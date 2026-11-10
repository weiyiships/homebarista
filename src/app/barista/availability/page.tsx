import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BaristaAvailability } from "@/components/barista/BaristaAvailability";
import { BaristaNav } from "@/components/barista/BaristaNav";
import { BARISTA_COOKIE, verifyBaristaToken } from "@/lib/auth/baristaSession";
import { listMenuItems, listMilkOptions } from "@/lib/db/queries/menu";
import {
  toAvailabilityResponse,
  type AvailabilityView,
} from "@/lib/domain/availability";

export const dynamic = "force-dynamic";

/**
 * /barista/availability: turn drinks and milks on or off (FR-5, US-6).
 * Middleware already gates this route; the session is re-checked here.
 */
export default async function BaristaAvailabilityPage() {
  const cookieStore = await cookies();
  const authed = await verifyBaristaToken(
    cookieStore.get(BARISTA_COOKIE)?.value,
  );
  if (!authed) {
    redirect(
      `/barista/login?next=${encodeURIComponent("/barista/availability")}`,
    );
  }

  let initial: AvailabilityView = { drinks: [], milks: [] };
  let loadFailed = false;
  try {
    const [drinks, milks] = await Promise.all([
      listMenuItems(),
      listMilkOptions(),
    ]);
    initial = toAvailabilityResponse(drinks, milks);
  } catch {
    loadFailed = true;
  }

  return (
    <main className="flex flex-col gap-6 py-6">
      <BaristaNav current="availability" />
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Availability
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Turn off anything you can&apos;t make. Guests see the change within a
          few seconds.
        </p>
      </header>
      <BaristaAvailability initial={initial} loadFailed={loadFailed} />
    </main>
  );
}
