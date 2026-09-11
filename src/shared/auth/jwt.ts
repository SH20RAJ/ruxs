export type UserRole =
  | "CUSTOMER"
  | "VENDOR_ADMIN"
  | "DELIVERY_STAFF"
  | "HOUSEHOLD_MEMBER"
  | "PLATFORM_ADMIN";

export interface SessionClaims {
  sub: string;
  phone: string;
  role: UserRole;
  tenantId?: string;
  householdId?: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Signs a JWT session token using native Edge Web Crypto API (HMAC-SHA256).
 */
export async function signSessionJwt(
  claims: Omit<SessionClaims, "iat" | "exp">,
  secret: string,
  expiresInSeconds: number = 30 * 24 * 60 * 60 // 30 days default
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullClaims: SessionClaims = {
    ...claims,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullClaims));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await getHmacKey(secret);
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));

  let binarySig = "";
  const bytes = new Uint8Array(signatureBytes);
  for (let i = 0; i < bytes.length; i++) {
    binarySig += String.fromCharCode(bytes[i]);
  }
  const encodedSignature = btoa(binarySig).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${data}.${encodedSignature}`;
}

/**
 * Verifies and decodes a JWT session token using native Edge Web Crypto API.
 */
export async function verifySessionJwt(token: string, secret: string): Promise<SessionClaims | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const key = await getHmacKey(secret);
    let base64Sig = encodedSignature.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Sig.length % 4) {
      base64Sig += "=";
    }
    const binarySig = atob(base64Sig);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(data)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const claims = JSON.parse(payloadJson) as SessionClaims;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp && claims.exp < now) {
      return null;
    }

    return claims;
  } catch {
    return null;
  }
}
