import { SubscriptionEngine } from "@/src/modules/subscriptions/subscription-engine";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const tenantId = searchParams.get("tenantId");

  if (customerId) {
    const list = await SubscriptionEngine.listByCustomer(customerId);
    return Response.json(createSuccessResponse(list));
  }

  if (tenantId) {
    const list = await SubscriptionEngine.listByTenant(tenantId);
    return Response.json(createSuccessResponse(list));
  }

  return Response.json(
    createErrorResponse("VALIDATION_FAILED", "Please provide customerId or tenantId"),
    { status: 400 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sub = await SubscriptionEngine.createSubscription(body);
    return Response.json(createSuccessResponse(sub), { status: 201 });
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
