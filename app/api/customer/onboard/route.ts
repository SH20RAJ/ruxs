import { CustomerService } from "@/src/modules/customer/customer-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await CustomerService.onboardCustomer(body);
    return Response.json(createSuccessResponse(customer), { status: 201 });
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
