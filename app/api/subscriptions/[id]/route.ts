import { SubscriptionEngine } from "@/src/modules/subscriptions/subscription-engine";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as { action: "pause" | "resume" | "cancel" };

    let updated;
    if (body.action === "pause") {
      updated = await SubscriptionEngine.pauseSubscription(id);
    } else if (body.action === "resume") {
      updated = await SubscriptionEngine.resumeSubscription(id);
    } else if (body.action === "cancel") {
      updated = await SubscriptionEngine.cancelSubscription(id);
    } else {
      return Response.json(
        createErrorResponse("VALIDATION_FAILED", "Action must be pause, resume, or cancel"),
        { status: 400 }
      );
    }

    return Response.json(createSuccessResponse(updated));
  } catch (error) {
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Internal Server Error"
      ),
      { status: 400 }
    );
  }
}
