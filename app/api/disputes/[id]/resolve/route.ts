import { DisputeService } from "@/src/modules/disputes/dispute-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await DisputeService.resolveDispute(id, body);
    return Response.json(createSuccessResponse(result));
  } catch (error) {
    if (error instanceof ZodError) {
      const msg = error.issues[0]?.message || "Validation failed";
      return Response.json(createErrorResponse("VALIDATION_FAILED", msg), { status: 400 });
    }
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Failed to resolve dispute"
      ),
      { status: 400 }
    );
  }
}
