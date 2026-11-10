import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/lib/auth/customerSession";
import { SiteHeaderView } from "./SiteHeaderView";

/** Reads the customer session on the server and renders the site header. */
export async function SiteHeader() {
  const cookieStore = await cookies();
  const customer = await verifyCustomerToken(
    cookieStore.get(CUSTOMER_COOKIE)?.value,
  );
  return (
    <SiteHeaderView customer={customer ? { name: customer.name } : null} />
  );
}
