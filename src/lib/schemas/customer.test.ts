import { describe, expect, it } from "vitest";
import { SignupSchema } from "./customer";

function issues(input: unknown) {
  const result = SignupSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.path[0]);
}

describe("SignupSchema", () => {
  const valid = {
    name: "  Alice  ",
    email: "  Alice@Example.COM ",
    password: "correct horse",
  };

  it("trims the name and normalizes the email to lowercase", () => {
    expect(SignupSchema.parse(valid)).toEqual({
      name: "Alice",
      email: "alice@example.com",
      password: "correct horse",
    });
  });

  it("does not trim or alter the password", () => {
    expect(
      SignupSchema.parse({ ...valid, password: " spaced pw " }).password,
    ).toBe(" spaced pw ");
  });

  it("requires a name", () => {
    expect(issues({ ...valid, name: "   " })).toEqual(["name"]);
  });

  it("rejects names longer than 60 characters", () => {
    expect(issues({ ...valid, name: "a".repeat(61) })).toEqual(["name"]);
  });

  it("requires a valid email", () => {
    expect(issues({ ...valid, email: "alice@" })).toEqual(["email"]);
    expect(issues({ ...valid, email: undefined })).toEqual(["email"]);
  });

  it("requires a password of at least 8 characters", () => {
    expect(issues({ ...valid, password: "1234567" })).toEqual(["password"]);
    expect(issues({ ...valid, password: "12345678" })).toEqual([]);
  });

  it("rejects passwords over bcrypt's 72-byte limit", () => {
    expect(issues({ ...valid, password: "a".repeat(72) })).toEqual([]);
    expect(issues({ ...valid, password: "a".repeat(73) })).toEqual([
      "password",
    ]);
    // 4 bytes per emoji in UTF-8: 19 × 4 = 76 bytes.
    expect(issues({ ...valid, password: "😀".repeat(19) })).toEqual([
      "password",
    ]);
  });
});
