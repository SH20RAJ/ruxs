import { normalizeIndianPhone } from "./phone";

interface StoredOtp {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP store (Redis fallback in prod)
const otpStore = new Map<string, StoredOtp>();

// Rate limit tracker: phone -> request timestamps
const rateLimitStore = new Map<string, number[]>();

export function generateRandomOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Requests an OTP for an Indian phone number.
 * Enforces rate limiting: Max 3 requests per 15 minutes.
 */
export async function requestPhoneOtp(
  rawPhone: string,
  options?: { fixedCode?: string; isDev?: boolean }
): Promise<{ phone: string; expiresAt: number; debugCode?: string }> {
  const phone = normalizeIndianPhone(rawPhone);
  const now = Date.now();

  // Check rate limit
  const timestamps = rateLimitStore.get(phone) || [];
  const recentTimestamps = timestamps.filter((t) => now - t < 15 * 60 * 1000); // last 15 mins

  if (recentTimestamps.length >= 3 && !options?.isDev) {
    throw new Error("Too many OTP requests. Please wait 15 minutes before requesting again.");
  }

  recentTimestamps.push(now);
  rateLimitStore.set(phone, recentTimestamps);

  const code = options?.fixedCode || generateRandomOtp();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes TTL

  otpStore.set(phone, {
    code,
    expiresAt,
    attempts: 0,
  });

  return {
    phone,
    expiresAt,
    debugCode: options?.isDev ? code : undefined,
  };
}

/**
 * Verifies a submitted OTP against the stored code.
 */
export async function verifyPhoneOtp(
  rawPhone: string,
  submittedCode: string,
  options?: { isDev?: boolean }
): Promise<boolean> {
  const phone = normalizeIndianPhone(rawPhone);
  const record = otpStore.get(phone);

  // In development mode, permit 123456 as master test bypass
  if (options?.isDev && submittedCode === "123456") {
    otpStore.delete(phone);
    return true;
  }

  if (!record) {
    return false;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(phone);
    throw new Error("Too many invalid attempts. OTP invalidated.");
  }

  if (record.code === submittedCode) {
    otpStore.delete(phone); // Single-use consumption
    return true;
  }

  return false;
}
