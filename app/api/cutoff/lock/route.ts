import { CutoffEngine } from "@/src/modules/cutoff/cutoff-engine";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      tenantId?: string;
      serviceDate?: string;
      evaluationTime?: string;
    };

    const tenantId = body.tenantId || "ten_sharma_tiffin";
    const serviceDate = body.serviceDate || new Date().toISOString().split("T")[0];

    const result = CutoffEngine.lockExpiredCutoffs(
      tenantId,
      serviceDate,
      body.evaluationTime
    );

    return Response.json(createSuccessResponse(result));
  } catch (error) {
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Internal Server Error"
      ),
      { status: 500 }
    );
  }
}
