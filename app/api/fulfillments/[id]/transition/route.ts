import { FulfillmentStateMachine } from "@/src/modules/fulfillment/fulfillment-fsm";
import { TransitionActionSchema } from "@/src/modules/fulfillment/fulfillment-schema";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let fulfillment = await FulfillmentStateMachine.getByIdAsync(id);
    if (!fulfillment) {
      fulfillment = FulfillmentStateMachine.getById(id);
    }

    if (!fulfillment) {
      return Response.json(
        createErrorResponse("NOT_FOUND", `Fulfillment ${id} not found`),
        { status: 404 }
      );
    }

    const body = await request.json();
    const action = TransitionActionSchema.parse(body);

    const updated = FulfillmentStateMachine.transition(fulfillment, action);
    return Response.json(createSuccessResponse(updated));
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
      { status: 400 }
    );
  }
}
