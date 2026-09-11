import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPhoneOtp } from "@/src/shared/auth/otp";
import { signSessionJwt, type UserRole } from "@/src/shared/auth/jwt";
import { normalizeIndianPhone } from "@/src/shared/auth/phone";
import { createErrorResponse, createSuccessResponse } from "@/src/shared/errors";
import { getEnv } from "@/src/shared/config/env";

const VerifyOtpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6, "OTP must be exactly 6 digits"),
  role: z
    .enum(["CUSTOMER", "VENDOR_ADMIN", "DELIVERY_STAFF", "HOUSEHOLD_MEMBER", "PLATFORM_ADMIN"])
    .default("CUSTOMER"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = VerifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse("VALIDATION_FAILED", "Invalid OTP verification payload", parsed.error.format()),
        { status: 400 }
      );
    }

    const env = getEnv();
    const isDev = env.APP_ENV === "development";
    const normalizedPhone = normalizeIndianPhone(parsed.data.phone);

    const isValid = await verifyPhoneOtp(normalizedPhone, parsed.data.code, { isDev });

    if (!isValid) {
      return NextResponse.json(
        createErrorResponse("UNAUTHORIZED", "Invalid or expired OTP. Please try again."),
        { status: 401 }
      );
    }

    // Generate deterministic or random user ID for session
    const userId = `usr_${normalizedPhone.replace("+", "")}`;
    const token = await signSessionJwt(
      {
        sub: userId,
        phone: normalizedPhone,
        role: parsed.data.role as UserRole,
        tenantId: parsed.data.role === "VENDOR_ADMIN" ? `ten_${userId}` : undefined,
      },
      env.JWT_SIGNING_SECRET
    );

    const response = NextResponse.json(
      createSuccessResponse({
        user: {
          id: userId,
          phone: normalizedPhone,
          role: parsed.data.role,
        },
        token,
      })
    );

    // Set secure HTTP-only cookie
    response.cookies.set("ruxs_session", token, {
      httpOnly: true,
      secure: env.APP_ENV !== "development",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      createErrorResponse("INTERNAL_SERVER_ERROR", err.message || "Failed to verify OTP"),
      { status: 500 }
    );
  }
}
