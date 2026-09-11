import { FulfillmentStateMachine } from "@/src/modules/fulfillment/fulfillment-fsm";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const date = searchParams.get("date");
  const customerId = searchParams.get("customerId");

  if (tenantId && date) {
    const list = FulfillmentStateMachine.listByTenantAndDate(tenantId, date);
    return Response.json(createSuccessResponse(list));
  }

  if (customerId) {
    const list = FulfillmentStateMachine.listByCustomer(customerId);
    return Response.json(createSuccessResponse(list));
  }

  return Response.json(
    createErrorResponse(
      "VALIDATION_FAILED",
      "Must provide tenantId + date, or customerId"
    ),
    { status: 400 }
  );
}
