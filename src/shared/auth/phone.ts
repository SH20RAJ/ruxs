/**
 * Indian Mobile Number Normalization & E.164 Formatter
 * Supported formats:
 * - 9876543210
 * - 09876543210
 * - +919876543210
 * - +91 98765 43210
 * - 919876543210
 */
export function normalizeIndianPhone(input: string): string {
  if (!input || typeof input !== "string") {
    throw new Error("Invalid phone number input");
  }

  // Strip all non-digit characters except leading +
  const cleaned = input.replace(/[^\d+]/g, "");

  // Match standard 10-digit Indian mobile numbers (starts with 6, 7, 8, 9)
  const tenDigitRegex = /^[6-9]\d{9}$/;

  if (tenDigitRegex.test(cleaned)) {
    return `+91${cleaned}`;
  }

  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    const national = cleaned.slice(3);
    if (tenDigitRegex.test(national)) {
      return cleaned;
    }
  }

  if (cleaned.startsWith("91") && cleaned.length === 12) {
    const national = cleaned.slice(2);
    if (tenDigitRegex.test(national)) {
      return `+91${national}`;
    }
  }

  if (cleaned.startsWith("0") && cleaned.length === 11) {
    const national = cleaned.slice(1);
    if (tenDigitRegex.test(national)) {
      return `+91${national}`;
    }
  }

  throw new Error("Invalid Indian mobile number. Must be a valid 10-digit mobile number starting with 6-9.");
}

export function isValidIndianPhone(input: string): boolean {
  try {
    normalizeIndianPhone(input);
    return true;
  } catch {
    return false;
  }
}
