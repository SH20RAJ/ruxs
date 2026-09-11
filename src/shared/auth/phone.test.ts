import { describe, expect, it } from "bun:test";
import { isValidIndianPhone, normalizeIndianPhone } from "./phone";

describe("Indian Phone Normalization", () => {
  it("normalizes a 10-digit number to +91 E.164 format", () => {
    expect(normalizeIndianPhone("9876543210")).toBe("+919876543210");
  });

  it("handles numbers with spaces and dashes", () => {
    expect(normalizeIndianPhone("98765-43210")).toBe("+919876543210");
    expect(normalizeIndianPhone("+91 98765 43210")).toBe("+919876543210");
  });

  it("handles leading 0 and leading 91", () => {
    expect(normalizeIndianPhone("09876543210")).toBe("+919876543210");
    expect(normalizeIndianPhone("919876543210")).toBe("+919876543210");
  });

  it("rejects invalid numbers", () => {
    expect(() => normalizeIndianPhone("1234567890")).toThrow(); // Starts with 1
    expect(() => normalizeIndianPhone("98765")).toThrow(); // Too short
    expect(() => normalizeIndianPhone("abcdefghij")).toThrow();
  });

  it("validates using isValidIndianPhone boolean helper", () => {
    expect(isValidIndianPhone("9876543210")).toBe(true);
    expect(isValidIndianPhone("12345")).toBe(false);
  });
});
