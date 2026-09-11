import { BillingEngine } from "@/src/modules/billing/billing-engine";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const tenantId = searchParams.get("tenantId");

  if (customerId) {
    const list = await BillingEngine.listByCustomer(customerId);
    return Response.json(createSuccessResponse(list));
  }

  if (tenantId) {
    const list = await BillingEngine.listByTenant(tenantId);
    return Response.json(createSuccessResponse(list));
  }

  return Response.json(
    createErrorResponse("VALIDATION_FAILED", "customerId or tenantId is required"),
    { status: 400 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invoice = await BillingEngine.generateInvoice(body);
    return Response.json(createSuccessResponse(invoice), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const msg = error.issues[0]?.message || "Validation failed";
      return Response.json(createErrorResponse("VALIDATION_FAILED", msg), { status: 400 });
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
