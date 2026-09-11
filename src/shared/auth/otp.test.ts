import { describe, expect, it } from "bun:test";
import { requestPhoneOtp, verifyPhoneOtp } from "./otp";

describe("Phone OTP Service", () => {
  const phone = "9876543210";

  it("generates and verifies a valid OTP", async () => {
    const { debugCode } = await requestPhoneOtp(phone, { fixedCode: "849201", isDev: true });
    expect(debugCode).toBe("849201");

    const isValid = await verifyPhoneOtp(phone, "849201");
    expect(isValid).toBe(true);

    // Assert single-use: verifying again fails
    const secondTry = await verifyPhoneOtp(phone, "849201");
    expect(secondTry).toBe(false);
  });

  it("rejects wrong OTP codes", async () => {
    await requestPhoneOtp(phone, { fixedCode: "555111", isDev: true });
    const isValid = await verifyPhoneOtp(phone, "000000");
    expect(isValid).toBe(false);
  });

  it("supports dev mode master code 123456", async () => {
    await requestPhoneOtp(phone, { fixedCode: "777888", isDev: true });
    const isValid = await verifyPhoneOtp(phone, "123456", { isDev: true });
    expect(isValid).toBe(true);
  });
});
