// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getRounds } from "bcryptjs";
import { BCRYPT_COST, hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("uses bcrypt with cost 12 and never returns the plain text", async () => {
    const hash = await hashPassword("correct horse");

    expect(BCRYPT_COST).toBe(12);
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
    expect(getRounds(hash)).toBe(12);
    expect(hash).not.toContain("correct horse");
  });

  it("salts every hash", async () => {
    const [a, b] = await Promise.all([
      hashPassword("correct horse"),
      hashPassword("correct horse"),
    ]);
    expect(a).not.toBe(b);
  });

  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse");

    await expect(verifyPassword("correct horse", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong horse", hash)).resolves.toBe(false);
  });
});
