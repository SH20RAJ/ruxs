import { describe, expect, it } from "bun:test";
import { evaluateCutoffAction } from "./cutoff-validator";

describe("Cutoff Engine & Policy Evaluation", () => {
  const cutoff = new Date("2026-10-11T10:00:00.000Z");

  it("permits standard skip prior to cutoff with 0% charge", () => {
    const earlyAction = new Date("2026-10-11T09:15:00.000Z");
    const result = evaluateCutoffAction({
      cutoffTime: cutoff,
      actionTime: earlyAction,
      policy: "CHARGE_INGREDIENT_PERCENTAGE",
    });

    expect(result.isAllowed).toBe(true);
    expect(result.status).toBe("SKIPPED");
    expect(result.chargePercentage).toBe(0);
  });

  it("permits skip exactly at the cutoff millisecond", () => {
    const exactCutoff = new Date("2026-10-11T10:00:00.000Z");
    const result = evaluateCutoffAction({
      cutoffTime: cutoff,
      actionTime: exactCutoff,
      policy: "FORBIDDEN",
    });

    expect(result.isAllowed).toBe(true);
    expect(result.status).toBe("SKIPPED");
    expect(result.chargePercentage).toBe(0);
  });

  it("enforces FORBIDDEN policy when action occurs after cutoff", () => {
    const lateAction = new Date("2026-10-11T10:00:01.000Z");
    const result = evaluateCutoffAction({
      cutoffTime: cutoff,
      actionTime: lateAction,
      policy: "FORBIDDEN",
    });

    expect(result.isAllowed).toBe(false);
    expect(result.status).toBe("REJECTED");
  });

  it("applies ingredient percentage fee on late skips", () => {
    const lateAction = new Date("2026-10-11T10:14:00.000Z");
    const result = evaluateCutoffAction({
      cutoffTime: cutoff,
      actionTime: lateAction,
      policy: "CHARGE_INGREDIENT_PERCENTAGE",
      customLatePercentage: 50,
    });

    expect(result.isAllowed).toBe(true);
    expect(result.status).toBe("LATE_SKIP");
    expect(result.chargePercentage).toBe(50);
  });

  it("applies full price charge when policy is CHARGE_FULL_PRICE", () => {
    const lateAction = new Date("2026-10-11T10:05:00.000Z");
    const result = evaluateCutoffAction({
      cutoffTime: cutoff,
      actionTime: lateAction,
      policy: "CHARGE_FULL_PRICE",
    });

    expect(result.isAllowed).toBe(true);
    expect(result.status).toBe("LATE_SKIP");
    expect(result.chargePercentage).toBe(100);
  });
});
