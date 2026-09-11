/**
 * Integer Paise representation for RUXS financial ledgers.
 * Guarantees zero floating-point arithmetic drift (e.g., 0.1 + 0.2 != 0.3).
 * 1 INR = 100 Paise.
 */
export type Paise = number & { readonly __brand: unique symbol };

/**
 * Converts a rupee float/number into safe integer Paise.
 */
export function toPaise(rupees: number): Paise {
  if (isNaN(rupees) || !isFinite(rupees)) {
    throw new TypeError("Invalid numerical rupee amount");
  }
  return Math.round(rupees * 100) as Paise;
}

/**
 * Converts integer Paise to a float number of rupees.
 */
export function toRupees(paise: Paise): number {
  return paise / 100;
}

/**
 * Formats integer Paise into a localized INR currency string (e.g., "₹3,680.00").
 */
export function formatINR(paise: Paise, options?: { hideDecimalsIfZero?: boolean }): string {
  const rupees = paise / 100;
  const isZeroDecimals = rupees % 1 === 0 && options?.hideDecimalsIfZero;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: isZeroDecimals ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Safe integer addition for Paise.
 */
export function addPaise(a: Paise, b: Paise): Paise {
  return (a + b) as Paise;
}

/**
 * Safe integer subtraction for Paise.
 */
export function subtractPaise(a: Paise, b: Paise): Paise {
  return (a - b) as Paise;
}

/**
 * Calculates a percentage charge in Paise with safe rounding (e.g., 50% late fee).
 */
export function calculatePercentage(amount: Paise, percentage: number): Paise {
  if (percentage < 0 || percentage > 100) {
    throw new RangeError("Percentage must be between 0 and 100");
  }
  return Math.round((amount * percentage) / 100) as Paise;
}
