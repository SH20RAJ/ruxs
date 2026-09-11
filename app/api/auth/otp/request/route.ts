import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPhoneOtp } from "@/src/shared/auth/otp";
import { createErrorResponse, createSuccessResponse } from "@/src/shared/errors";
import { getEnv } from "@/src/shared/config/env";

const RequestOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must have at least 10 digits"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = RequestOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse("VALIDATION_FAILED", "Please enter a valid 10-digit mobile number", parsed.error.format()),
        { status: 400 }
      );
    }

    const env = getEnv();
    const isDev = env.APP_ENV === "development";

    const result = await requestPhoneOtp(parsed.data.phone, { isDev });

    return NextResponse.json(
      createSuccessResponse({
        phone: result.phone,
        message: isDev ? `OTP generated: ${result.debugCode} (or use 123456)` : "OTP dispatched via WhatsApp / SMS",
        expiresAt: result.expiresAt,
        ...(isDev ? { debugCode: result.debugCode } : {}),
      })
    );
  } catch (err: any) {
    return NextResponse.json(
      createErrorResponse("INTERNAL_SERVER_ERROR", err.message || "Failed to process OTP request"),
      { status: 400 }
    );
  }
}
