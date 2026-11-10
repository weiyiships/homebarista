import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./support/a11y";
import { placeLatteOrder } from "./support/flows";

test.describe("guest ordering (US-1, US-2, US-5)", () => {
  test("browse menu, customize a drink, order, and see the status page", async ({
    page,
  }) => {
    await page.goto("/menu");
    await expect(
      page.getByRole("heading", { level: 1, name: "Our Menu" }),
    ).toBeVisible();
    for (const drink of [
      "Espresso",
      "Americano",
      "Latte",
      "Cappuccino",
      "Flat White",
      "Mocha",
    ]) {
      await expect(
        page.getByRole("button", { name: new RegExp(`^${drink}`, "i") }),
      ).toBeVisible();
    }
    await expectNoA11yViolations(page);

    await placeLatteOrder(page, "Guest Gina");

    await expect(
      page.getByRole("heading", { level: 1, name: "Guest Gina’s order" }),
    ).toBeVisible();
    await expect(page.getByTestId("order-status-badge")).toHaveText("Received");
    await expect(page.getByText("Large · Oat milk · Iced")).toBeVisible();
    await expect(page.getByText(/You're next|ahead of you/)).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test("ordering needs only a name, no account", async ({ page }) => {
    await page.goto("/menu");
    await page.getByRole("button", { name: /^espresso/i }).click();
    const drawer = page.getByRole("dialog", { name: "Customize Espresso" });
    await drawer.getByRole("button", { name: "Place Order" }).click();

    await expect(drawer.getByRole("alert")).toContainText(
      "Your name is required.",
    );
    await expect(page).toHaveURL(/\/menu$/);
  });

  test("an unknown order shows not found", async ({ page }) => {
    const response = await page.goto(
      "/order/00000000-0000-4000-8000-000000000000",
    );
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Order not found" }),
    ).toBeVisible();
  });
});
