import { CutoffEngine } from "@/src/modules/cutoff/cutoff-engine";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") || "ten_sharma_tiffin";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const shift = searchParams.get("shift") || "LUNCH";

  const counter = CutoffEngine.getKitchenBatchCounter(tenantId, date, shift);
  return Response.json(createSuccessResponse(counter));
}
