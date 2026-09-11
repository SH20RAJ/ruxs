import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/src/shared/auth/jwt";
import { createErrorResponse, createSuccessResponse } from "@/src/shared/errors";
import { getEnv } from "@/src/shared/config/env";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ruxs_session")?.value;

    if (!token) {
      return NextResponse.json(
        createErrorResponse("UNAUTHORIZED", "No active session found"),
        { status: 401 }
      );
    }

    const env = getEnv();
    const session = await verifySessionJwt(token, env.JWT_SIGNING_SECRET);

    if (!session) {
      return NextResponse.json(
        createErrorResponse("UNAUTHORIZED", "Session expired or invalid"),
        { status: 401 }
      );
    }

    return NextResponse.json(createSuccessResponse({ session }));
  } catch (err: any) {
    return NextResponse.json(
      createErrorResponse("INTERNAL_SERVER_ERROR", err.message || "Failed to retrieve session"),
      { status: 500 }
    );
  }
}
