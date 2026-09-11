import { describe, expect, it } from "bun:test";
import { signSessionJwt, verifySessionJwt } from "./jwt";

describe("Edge JWT Web Crypto Tokens", () => {
  const secret = "test-secret-must-be-at-least-16-characters-long";

  it("signs and verifies a valid session token", async () => {
    const claims = {
      sub: "usr_123456",
      phone: "+919876543210",
      role: "CUSTOMER" as const,
      householdId: "hsh_999",
    };

    const token = await signSessionJwt(claims, secret, 3600);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifySessionJwt(token, secret);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe("usr_123456");
    expect(verified?.phone).toBe("+919876543210");
    expect(verified?.role).toBe("CUSTOMER");
  });

  it("rejects tokens with invalid signatures", async () => {
    const token = await signSessionJwt(
      { sub: "usr_1", phone: "+919876543210", role: "CUSTOMER" },
      secret,
      3600
    );

    const tamperedToken = token.slice(0, -4) + "AAAA";
    const result = await verifySessionJwt(tamperedToken, secret);
    expect(result).toBeNull();
  });

  it("rejects expired tokens", async () => {
    // Expired immediately (-1 second)
    const token = await signSessionJwt(
      { sub: "usr_1", phone: "+919876543210", role: "CUSTOMER" },
      secret,
      -10
    );

    const result = await verifySessionJwt(token, secret);
    expect(result).toBeNull();
  });
});
