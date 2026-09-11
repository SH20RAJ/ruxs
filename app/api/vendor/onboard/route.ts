import { VendorService } from "@/src/modules/vendor/vendor-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const vendor = await VendorService.onboardVendor(body);
    return Response.json(createSuccessResponse(vendor), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMsg = error.issues[0]?.message || "Validation failed";
      return Response.json(createErrorResponse("VALIDATION_FAILED", errorMsg), { status: 400 });
    }
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Internal Server Error"
      ),
      { status: 500 }
    );
  }
}

