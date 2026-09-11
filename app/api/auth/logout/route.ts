import { NextResponse } from "next/server";
import { createSuccessResponse } from "@/src/shared/errors";

export async function POST() {
  const response = NextResponse.json(
    createSuccessResponse({ message: "Successfully logged out of RUXS" })
  );

  // Expire session cookie
  response.cookies.set("ruxs_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
