import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { customers, menuItems, options, orderItems, orders } from "./schema";

describe("menuItems table schema", () => {
  it("has the expected columns", () => {
    const cols = getTableColumns(menuItems);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("name");
    expect(cols).toHaveProperty("available");
    expect(cols).toHaveProperty("takesMilk");
    expect(cols).toHaveProperty("sizeType");
  });

  it("id column is a uuid with a default", () => {
    const cols = getTableColumns(menuItems);
    expect(cols.id.dataType).toBe("string"); // drizzle uuid maps to "string"
    expect(cols.id.hasDefault).toBe(true);
  });

  it("name column is not null", () => {
    const cols = getTableColumns(menuItems);
    expect(cols.name.notNull).toBe(true);
  });

  it("available defaults to true", () => {
    const cols = getTableColumns(menuItems);
    expect(cols.available.notNull).toBe(true);
    expect(cols.available.hasDefault).toBe(true);
  });

  it("takesMilk defaults to false", () => {
    const cols = getTableColumns(menuItems);
    expect(cols.takesMilk.notNull).toBe(true);
    expect(cols.takesMilk.hasDefault).toBe(true);
  });

  it("sizeType is not null", () => {
    const cols = getTableColumns(menuItems);
    expect(cols.sizeType.notNull).toBe(true);
  });
});

describe("options table schema", () => {
  it("has the expected columns", () => {
    const cols = getTableColumns(options);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("type");
    expect(cols).toHaveProperty("label");
    expect(cols).toHaveProperty("available");
  });

  it("type and label are not null", () => {
    const cols = getTableColumns(options);
    expect(cols.type.notNull).toBe(true);
    expect(cols.label.notNull).toBe(true);
  });

  it("available defaults to true", () => {
    const cols = getTableColumns(options);
    expect(cols.available.hasDefault).toBe(true);
  });
});

describe("customers table schema", () => {
  it("has the expected columns", () => {
    const cols = getTableColumns(customers);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("name");
    expect(cols).toHaveProperty("email");
    expect(cols).toHaveProperty("passwordHash");
    expect(cols).toHaveProperty("createdAt");
  });

  it("email is not null", () => {
    const cols = getTableColumns(customers);
    expect(cols.email.notNull).toBe(true);
  });

  it("passwordHash is not null", () => {
    const cols = getTableColumns(customers);
    expect(cols.passwordHash.notNull).toBe(true);
  });

  it("createdAt has a default", () => {
    const cols = getTableColumns(customers);
    expect(cols.createdAt.hasDefault).toBe(true);
  });
});

describe("orders table schema", () => {
  it("has the expected columns", () => {
    const cols = getTableColumns(orders);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("guestName");
    expect(cols).toHaveProperty("customerId");
    expect(cols).toHaveProperty("status");
    expect(cols).toHaveProperty("createdAt");
    expect(cols).toHaveProperty("updatedAt");
  });

  it("guestName is not null", () => {
    const cols = getTableColumns(orders);
    expect(cols.guestName.notNull).toBe(true);
  });

  it("customerId is nullable (FK to customers)", () => {
    const cols = getTableColumns(orders);
    // nullable FK — notNull should be false (or undefined)
    expect(cols.customerId.notNull).toBeFalsy();
  });

  it("status defaults to received", () => {
    const cols = getTableColumns(orders);
    expect(cols.status.notNull).toBe(true);
    expect(cols.status.hasDefault).toBe(true);
  });

  it("createdAt and updatedAt have defaults", () => {
    const cols = getTableColumns(orders);
    expect(cols.createdAt.hasDefault).toBe(true);
    expect(cols.updatedAt.hasDefault).toBe(true);
  });
});

describe("orderItems table schema", () => {
  it("has the expected columns", () => {
    const cols = getTableColumns(orderItems);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("orderId");
    expect(cols).toHaveProperty("menuItemId");
    expect(cols).toHaveProperty("optionsJson");
  });

  it("orderId and menuItemId are not null", () => {
    const cols = getTableColumns(orderItems);
    expect(cols.orderId.notNull).toBe(true);
    expect(cols.menuItemId.notNull).toBe(true);
  });

  it("optionsJson has a default", () => {
    const cols = getTableColumns(orderItems);
    expect(cols.optionsJson.hasDefault).toBe(true);
  });
});
