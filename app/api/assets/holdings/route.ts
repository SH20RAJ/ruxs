import { AssetLedgerService } from "@/src/modules/assets/asset-ledger";
import { AssetType } from "@/src/modules/assets/asset-schema";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const customerId = searchParams.get("customerId");
  const assetType = (searchParams.get("assetType") as AssetType) || "WATER_JAR_20L";

  if (!tenantId || !customerId) {
    return Response.json(
      createErrorResponse("VALIDATION_FAILED", "tenantId and customerId are required"),
      { status: 400 }
    );
  }

  const holding = AssetLedgerService.getHolding(tenantId, customerId, assetType);
  return Response.json(createSuccessResponse(holding));
}
