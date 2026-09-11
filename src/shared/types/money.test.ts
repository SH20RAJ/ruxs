import { describe, expect, it } from "bun:test";
import { addPaise, calculatePercentage, formatINR, subtractPaise, toPaise, toRupees } from "./money";

describe("Money & Paise Ledger Arithmetic", () => {
  it("converts rupees to exact integer paise", () => {
    expect(toPaise(100)).toBe(10000 as any);
    expect(toPaise(90.5)).toBe(9050 as any);
    expect(toPaise(0.75)).toBe(75 as any);
  });

  it("prevents floating-point rounding errors", () => {
    // 0.1 + 0.2 in standard JS floats is 0.30000000000000004
    const a = toPaise(0.1);
    const b = toPaise(0.2);
    const sum = addPaise(a, b);
    expect(sum).toBe(30 as any);
    expect(toRupees(sum)).toBe(0.3);
  });

  it("correctly subtracts paise", () => {
    const total = toPaise(3680);
    const payment = toPaise(2000);
    const remaining = subtractPaise(total, payment);
    expect(toRupees(remaining)).toBe(1680);
  });

  it("formats Indian Rupee currency strings properly", () => {
    const amount = toPaise(3680.5);
    const formatted = formatINR(amount);
    expect(formatted).toContain("3,680.50");
  });

  it("accurately calculates integer percentage fees (e.g. 50% late cancellation)", () => {
    const mealPrice = toPaise(90); // 9000 paise
    const fee50 = calculatePercentage(mealPrice, 50);
    expect(fee50).toBe(4500 as any);
    expect(toRupees(fee50)).toBe(45);

    const oddPrice = toPaise(75.5); // 7550 paise
    const fee = calculatePercentage(oddPrice, 50);
    expect(fee).toBe(3775 as any);
  });
});
