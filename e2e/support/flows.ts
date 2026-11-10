import {
  expect,
  test,
  type Browser,
  type Locator,
  type Page,
} from "@playwright/test";
import { E2E_BARISTA_PASSCODE } from "../../playwright.config";

/** Picks a drink on the menu, customizes it, and places the order. */
export async function placeLatteOrder(page: Page, guestName?: string) {
  await page.goto("/menu");
  await page.getByRole("button", { name: /^latte/i }).click();

  const drawer = page.getByRole("dialog", { name: "Customize Latte" });
  await expect(drawer).toBeVisible();
  if (guestName !== undefined) {
    await drawer.getByLabel(/your name/i).fill(guestName);
  }
  // Radios are visually hidden inside their labels; tap the label like a user.
  await chooseOption(drawer, "Iced");
  await chooseOption(drawer, "Large");
  await chooseOption(drawer, "Oat");
  await drawer.getByRole("button", { name: "Place Order" }).click();

  await expect(page).toHaveURL(/\/order\/[0-9a-f-]{36}$/);
  return page.url().split("/").pop() as string;
}

export async function logInAsBarista(page: Page) {
  await page.goto("/barista");
  await expect(page).toHaveURL(/\/barista\/login/);
  await page.getByLabel("Barista passcode").fill(E2E_BARISTA_PASSCODE);
  await page.getByRole("button", { name: "Unlock queue" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Barista queue" }),
  ).toBeVisible();
}

async function chooseOption(drawer: Locator, label: string) {
  await drawer.getByText(label, { exact: true }).click();
  await expect(drawer.getByRole("radio", { name: label })).toBeChecked();
}

/** App alerts, excluding Next.js's built-in route announcer. */
export function appAlert(page: Page | Locator): Locator {
  return page.locator('[role="alert"]:not(#__next-route-announcer__)');
}

/**
 * A separate phone (own cookies) with the project's 375px device settings,
 * e.g. one for the guest and one for the barista.
 */
export async function newPhone(browser: Browser): Promise<Page> {
  const {
    viewport,
    isMobile,
    hasTouch,
    userAgent,
    deviceScaleFactor,
    baseURL,
  } = test.info().project.use;
  const context = await browser.newContext({
    viewport,
    isMobile,
    hasTouch,
    userAgent,
    deviceScaleFactor,
    baseURL,
  });
  return context.newPage();
}

/**
 * Guest name unique to this test attempt. Retries share the database, so a
 * reused name would match a leftover card from the failed attempt.
 */
export function uniqueName(base: string): string {
  return `${base} ${Date.now() % 100_000}-${test.info().retry}`;
}
