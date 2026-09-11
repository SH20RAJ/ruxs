import { DeliveryEngine } from "@/src/modules/delivery/delivery-engine";
import { GenerateRunSheetInputSchema } from "@/src/modules/delivery/delivery-schema";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return Response.json(
      createErrorResponse("VALIDATION_FAILED", "runId query parameter is required"),
      { status: 400 }
    );
  }

  const run = DeliveryEngine.getRunSheet(runId);
  if (!run) {
    return Response.json(
      createErrorResponse("NOT_FOUND", `Run sheet ${runId} not found`),
      { status: 404 }
    );
  }

  return Response.json(createSuccessResponse(run));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = GenerateRunSheetInputSchema.parse(body);
    const run = DeliveryEngine.generateRunSheet(validated);
    return Response.json(createSuccessResponse(run), { status: 201 });
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
