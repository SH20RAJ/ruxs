import { BillingEngine } from "@/src/modules/billing/billing-engine";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = await BillingEngine.getById(id);

  if (!invoice) {
    return Response.json(
      createErrorResponse("NOT_FOUND", `Invoice ${id} not found`),
      { status: 404 }
    );
  }

  return Response.json(createSuccessResponse(invoice));
}
