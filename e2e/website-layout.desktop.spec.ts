import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./support/a11y";
import { logInAsBarista, newPhone, placeLatteOrder } from "./support/flows";

test.describe("website layout at 1280px (#42)", () => {
  test("landing page is a full-width website with header, hero, and footer", async ({
    page,
  }) => {
    await page.goto("/");

    const header = page.getByRole("banner");
    await expect(
      header.getByRole("navigation", { name: "Main" }).getByRole("link", {
        name: "Menu",
      }),
    ).toBeVisible();
    expect(
      (await header.boundingBox())?.height ?? Infinity,
    ).toBeLessThanOrEqual(64);
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "How it works" }),
    ).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test("menu uses the 1200px width with three cards per row", async ({
    page,
  }) => {
    await page.goto("/menu");
    const cards = page
      .getByRole("list", { name: "Drink menu" })
      .getByRole("button");
    await expect(cards).toHaveCount(6);

    const boxes = await Promise.all(
      (await cards.all()).slice(0, 4).map((card) => card.boundingBox()),
    );
    const [a, b, c, d] = boxes.map((box) => box!);
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    expect(Math.abs(a.y - c.y)).toBeLessThan(2);
    expect(d.y).toBeGreaterThan(a.y + a.height - 1);

    const grid = await page
      .getByRole("list", { name: "Drink menu" })
      .boundingBox();
    expect(grid!.width).toBeGreaterThan(1000);
    expect(grid!.width).toBeLessThanOrEqual(1200);
    await expectNoA11yViolations(page);
  });

  test("barista queue shows Received, Brewing, and Ready columns", async ({
    browser,
    page,
  }) => {
    const guest = await newPhone(browser);
    await placeLatteOrder(guest, "Column Cleo");
    await placeLatteOrder(guest, "Column Rex");

    await logInAsBarista(page);
    const cleo = page.getByRole("article", { name: "Column Cleo" });
    await cleo.getByRole("button", { name: "Start brewing" }).click();
    await expect(cleo.getByTestId("queue-status-badge")).toHaveText("Brewing");

    const rex = page.getByRole("article", { name: "Column Rex" });
    const [cleoBox, rexBox] = await Promise.all([
      cleo.boundingBox(),
      rex.boundingBox(),
    ]);
    // Brewing column sits to the right of Received.
    expect(cleoBox!.x).toBeGreaterThan(rexBox!.x + rexBox!.width - 1);
    await expect(page.getByTestId("queue-board-columns")).toBeVisible();
    await expectNoA11yViolations(page);
  });
});
