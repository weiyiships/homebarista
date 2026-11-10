import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./support/a11y";
import { appAlert, placeLatteOrder } from "./support/flows";

test.describe("customer accounts (US-10, US-11, US-12)", () => {
  test("sign up, order with the name filled in, see it in My orders, log out", async ({
    page,
  }) => {
    const email = `casey+${Date.now()}@example.com`;

    await page.goto("/signup");
    await expectNoA11yViolations(page);
    await page.getByLabel("Name").fill("Casey Customer");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correct horse battery");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/menu$/);
    await expect(page.getByText("Signed in as Casey Customer")).toBeVisible();

    await page.getByRole("button", { name: /^latte/i }).click();
    await expect(page.getByLabel(/your name/i)).toHaveValue("Casey Customer");
    await page.keyboard.press("Escape");
    await placeLatteOrder(page);

    await page.goto("/my-orders");
    await expect(
      page.getByRole("heading", { level: 1, name: "My orders" }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article").getByText("Latte")).toBeVisible();
    await expectNoA11yViolations(page);

    await page.goto("/menu");
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await page.goto("/my-orders");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("duplicate email is rejected case-insensitively; login works with any case", async ({
    page,
  }) => {
    const email = `dana+${Date.now()}@example.com`;
    await page.goto("/signup");
    await page.getByLabel("Name").fill("Dana");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correct horse battery");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/menu$/);
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();

    await page.goto("/signup");
    await page.getByLabel("Name").fill("Dana Again");
    await page.getByLabel("Email").fill(email.toUpperCase());
    await page.getByLabel("Password").fill("another password");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(appAlert(page)).toContainText(
      "An account with this email already exists",
    );

    await page.goto("/login");
    await expectNoA11yViolations(page);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(appAlert(page)).toHaveText("Invalid email or password");

    await page.getByLabel("Email").fill(email.toUpperCase());
    await page.getByLabel("Password").fill("correct horse battery");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Signed in as Dana")).toBeVisible();
  });
});
