import { DeliveryEngine } from "@/src/modules/delivery/delivery-engine";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { z, ZodError } from "zod";

const StopActionSchema = z.object({
  runId: z.string(),
  stopId: z.string(),
  action: z.enum(["DELIVER", "FAIL"]),
  assetCollected: z.number().int().nonnegative().optional(),
  assetDelivered: z.number().int().nonnegative().optional(),
  failureReason: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = StopActionSchema.parse(body);

    if (validated.action === "DELIVER") {
      const result = await DeliveryEngine.completeStop({
        runId: validated.runId,
        stopId: validated.stopId,
        assetCollected: validated.assetCollected,
        assetDelivered: validated.assetDelivered,
        notes: validated.notes,
      });
      return Response.json(createSuccessResponse(result));
    } else {
      if (!validated.failureReason) {
        return Response.json(
          createErrorResponse("VALIDATION_FAILED", "failureReason is required when action is FAIL"),
          { status: 400 }
        );
      }
      const result = DeliveryEngine.failStop({
        runId: validated.runId,
        stopId: validated.stopId,
        failureReason: validated.failureReason,
      });
      return Response.json(createSuccessResponse(result));
    }
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
