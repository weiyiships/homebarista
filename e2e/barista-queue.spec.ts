import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./support/a11y";
import {
  appAlert,
  logInAsBarista,
  newPhone,
  placeLatteOrder,
} from "./support/flows";

test.describe("barista queue (US-3, US-4) and live tracking (US-5)", () => {
  test("log in, see the order, advance it to picked up while the guest watches", async ({
    browser,
  }) => {
    const guest = await newPhone(browser);
    const orderId = await placeLatteOrder(guest, "Barista Bea");

    const barista = await newPhone(browser);
    await logInAsBarista(barista);
    await expectNoA11yViolations(barista);

    const card = barista.getByRole("article", { name: "Barista Bea" });
    await expect(card).toBeVisible();
    await expect(card.getByText("Latte")).toBeVisible();
    await expect(card.getByText("Oat milk")).toBeVisible();

    await card.getByRole("button", { name: "Start brewing" }).click();
    await expect(card.getByTestId("queue-status-badge")).toHaveText("Brewing");
    await expect(guest.getByTestId("order-status-badge")).toHaveText(
      "Brewing",
      { timeout: 5_000 },
    );

    await card.getByRole("button", { name: "Mark ready" }).click();
    await expect(card.getByTestId("queue-status-badge")).toHaveText("Ready");
    await expect(
      guest.getByRole("heading", { name: "Your drink is ready!" }),
    ).toBeVisible({ timeout: 5_000 });
    await expectNoA11yViolations(guest);

    await card.getByRole("button", { name: "Mark picked up" }).click();
    await expect(card).toHaveCount(0);
    await expect(guest.getByTestId("order-status-badge")).toHaveText(
      "Picked up",
      { timeout: 5_000 },
    );

    expect(guest.url()).toContain(orderId);
  });

  test("a new order appears in the open queue within 3 seconds", async ({
    browser,
  }) => {
    const barista = await newPhone(browser);
    await logInAsBarista(barista);

    const guest = await newPhone(browser);
    await placeLatteOrder(guest, "Speedy Sam");

    await expect(
      barista.getByRole("article", { name: "Speedy Sam" }),
    ).toBeVisible({ timeout: 3_000 });
  });

  test("cancelling needs confirmation", async ({ browser }) => {
    const guest = await newPhone(browser);
    await placeLatteOrder(guest, "Cancel Cody");
    const barista = await newPhone(browser);
    await logInAsBarista(barista);

    const card = barista.getByRole("article", { name: "Cancel Cody" });
    await card.getByRole("button", { name: "Cancel" }).click();
    await barista.getByRole("button", { name: "Cancel order" }).click();

    await expect(card).toHaveCount(0);
    await expect(
      guest.getByRole("heading", { name: "This order was cancelled" }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("barista pages and APIs need the passcode", async ({
    page,
    request,
  }) => {
    await page.goto("/barista");
    await expect(page).toHaveURL(/\/barista\/login\?next=%2Fbarista/);

    await page.getByLabel("Barista passcode").fill("wrong");
    await page.getByRole("button", { name: "Unlock queue" }).click();
    await expect(appAlert(page)).toHaveText("Incorrect passcode");
    await expectNoA11yViolations(page);

    expect((await request.get("/api/barista/queue")).status()).toBe(401);
  });
});
