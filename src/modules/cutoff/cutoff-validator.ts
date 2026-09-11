export type LateSkipPolicy =
  | "FORBIDDEN"
  | "CHARGE_FULL_PRICE"
  | "CHARGE_INGREDIENT_PERCENTAGE";

export interface CutoffEvaluationResult {
  isAllowed: boolean;
  status: "SKIPPED" | "LATE_SKIP" | "REJECTED";
  chargePercentage: number;
  reason: string;
}

/**
 * Evaluates whether a skip or cancellation action is before or after the operational cutoff.
 * Implements strict boundary enforcement: currentTime <= cutoffTime is a valid normal skip.
 */
export function evaluateCutoffAction(params: {
  cutoffTime: Date;
  actionTime: Date;
  policy: LateSkipPolicy;
  customLatePercentage?: number;
}): CutoffEvaluationResult {
  const { cutoffTime, actionTime, policy, customLatePercentage = 50 } = params;

  // Normal skip window (inclusive of cutoff boundary millisecond)
  if (actionTime.getTime() <= cutoffTime.getTime()) {
    return {
      isAllowed: true,
      status: "SKIPPED",
      chargePercentage: 0,
      reason: "Action received before cutoff window closed.",
    };
  }

  // Action received AFTER cutoff window
  switch (policy) {
    case "FORBIDDEN":
      return {
        isAllowed: false,
        status: "REJECTED",
        chargePercentage: 100,
        reason: "Cancellations are locked after the cutoff window has passed.",
      };

    case "CHARGE_FULL_PRICE":
      return {
        isAllowed: true,
        status: "LATE_SKIP",
        chargePercentage: 100,
        reason: "Late skip accepted after cutoff; 100% preparation charge applied.",
      };

    case "CHARGE_INGREDIENT_PERCENTAGE":
      return {
        isAllowed: true,
        status: "LATE_SKIP",
        chargePercentage: customLatePercentage,
        reason: `Late skip accepted after cutoff; ${customLatePercentage}% ingredient compensation fee applied.`,
      };
  }
}
