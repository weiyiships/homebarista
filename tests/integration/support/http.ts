import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { menuItems, options } from "@/lib/db/schema";
import { POST as baristaLogin } from "@/app/api/barista/session/route";
import { POST as signup } from "@/app/api/customers/route";
import { TEST_BARISTA_PASSCODE } from "./env";

const BASE = "http://localhost";

export function request(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    cookie?: string;
    raw?: string;
    headers?: Record<string, string>;
  } = {},
): NextRequest {
  const headers = new Headers({
    "content-type": "application/json",
    ...init.headers,
  });
  if (init.cookie) headers.set("cookie", init.cookie);
  return new NextRequest(new URL(path, BASE), {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers,
    body:
      init.raw ??
      (init.body === undefined ? undefined : JSON.stringify(init.body)),
  });
}

/** `name=value` of the first Set-Cookie on a response. */
export function sessionCookie(response: Response): string {
  const header = response.headers.get("set-cookie") ?? "";
  const pair = header.split(";")[0];
  if (!pair) throw new Error("Response did not set a cookie");
  return pair;
}

export const params = (id: string) => ({ params: Promise.resolve({ id }) });

export async function baristaCookie(): Promise<string> {
  const response = await baristaLogin(
    request("/api/barista/session", {
      body: { passcode: TEST_BARISTA_PASSCODE },
    }),
  );
  return sessionCookie(response);
}

export async function customerCookie(
  email = "ada@example.com",
): Promise<string> {
  const response = await signup(
    request("/api/customers", {
      body: { name: "Ada", email, password: "correct horse" },
    }),
  );
  return sessionCookie(response);
}

export async function drinkId(name: string): Promise<string> {
  const rows = await db.select().from(menuItems);
  const row = rows.find((r) => r.name === name);
  if (!row) throw new Error(`No seeded drink named ${name}`);
  return row.id;
}

export async function milkId(label: string): Promise<string> {
  const rows = await db.select().from(options);
  const row = rows.find((r) => r.type === "milk" && r.label === label);
  if (!row) throw new Error(`No seeded milk named ${label}`);
  return row.id;
}
