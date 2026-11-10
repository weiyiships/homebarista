import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/lib/auth/customerSession";

export const dynamic = "force-dynamic";

/** /login — optional customer login (FR-7, US-11). */
export default async function LoginPage() {
  const cookieStore = await cookies();
  const customer = await verifyCustomerToken(
    cookieStore.get(CUSTOMER_COOKIE)?.value,
  );
  if (customer) redirect("/menu");

  return (
    <main className="flex flex-col gap-6 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Log in</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Log in to fill in your name and keep your orders together. You can
          always order as a guest.
        </p>
      </header>
      <LoginForm />
    </main>
  );
}
