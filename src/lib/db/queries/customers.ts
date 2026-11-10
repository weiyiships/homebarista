import { eq, sql } from "drizzle-orm";
import { db } from "../index";
import { customers } from "../schema";

export interface PublicCustomer {
  id: string;
  name: string;
  email: string;
}

export type CreateCustomerResult =
  { ok: true; customer: PublicCustomer } | { ok: false; reason: "email_taken" };

const UNIQUE_VIOLATION = "23505";

function hasCode(value: unknown, code: string): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    (value as { code: unknown }).code === code
  );
}

/** True for a Postgres unique violation, raw or wrapped by Drizzle. */
export function isUniqueViolation(error: unknown): boolean {
  if (hasCode(error, UNIQUE_VIOLATION)) return true;
  return error instanceof Error && hasCode(error.cause, UNIQUE_VIOLATION);
}

/**
 * Creates a customer. `email` must already be lowercased; the check compares
 * case-insensitively, and the unique constraint catches a signup race.
 */
export async function createCustomer(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<CreateCustomerResult> {
  const [existing] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(sql`lower(${customers.email})`, data.email))
    .limit(1);
  if (existing) return { ok: false, reason: "email_taken" };

  try {
    const [customer] = await db.insert(customers).values(data).returning({
      id: customers.id,
      name: customers.name,
      email: customers.email,
    });
    return { ok: true, customer };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "email_taken" };
    throw error;
  }
}

export interface StoredCustomer extends PublicCustomer {
  passwordHash: string;
}

/** Looks a customer up by email, case-insensitively. */
export async function findCustomerByEmail(
  email: string,
): Promise<StoredCustomer | null> {
  const [customer] = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      passwordHash: customers.passwordHash,
    })
    .from(customers)
    .where(eq(sql`lower(${customers.email})`, email.toLowerCase()))
    .limit(1);
  return customer ?? null;
}
