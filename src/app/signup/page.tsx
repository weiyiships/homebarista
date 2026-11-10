import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/lib/auth/customerSession";

export const dynamic = "force-dynamic";

/** /signup — optional customer account (FR-7, US-10). */
export default async function SignupPage() {
  const cookieStore = await cookies();
  const customer = await verifyCustomerToken(
    cookieStore.get(CUSTOMER_COOKIE)?.value,
  );
  if (customer) redirect("/menu");

  return (
    <main className="flex flex-col gap-6 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Create an account
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Optional. An account remembers your name and keeps your order history
          across gatherings. You can always order as a guest.
        </p>
      </header>
      <SignupForm />
    </main>
  );
}
