import { VacationService } from "@/src/modules/vacation/vacation-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return Response.json(
      createErrorResponse("VALIDATION_FAILED", "customerId is required"),
      { status: 400 }
    );
  }

  const list = VacationService.listByCustomer(customerId);
  return Response.json(createSuccessResponse(list));
}
