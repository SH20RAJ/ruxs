import { KhataLedgerService } from "@/src/modules/khata/khata-ledger";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const customerId = searchParams.get("customerId");

  if (!tenantId || !customerId) {
    return Response.json(
      createErrorResponse("VALIDATION_FAILED", "tenantId and customerId are required"),
      { status: 400 }
    );
  }

  const statement = await KhataLedgerService.getCustomerStatement(tenantId, customerId);
  return Response.json(createSuccessResponse(statement));
}
