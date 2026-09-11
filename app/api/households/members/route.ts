import { HouseholdService } from "@/src/modules/households/household-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = HouseholdService.inviteMember(body);
    return Response.json(createSuccessResponse(result), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const msg = error.issues[0]?.message || "Validation failed";
      return Response.json(createErrorResponse("VALIDATION_FAILED", msg), { status: 400 });
    }
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Failed to invite member"
      ),
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const householdId = searchParams.get("householdId");
    const memberUserId = searchParams.get("memberUserId");
    const requestedByUserId = searchParams.get("requestedByUserId");

    if (!householdId || !memberUserId || !requestedByUserId) {
      return Response.json(
        createErrorResponse(
          "VALIDATION_FAILED",
          "householdId, memberUserId, and requestedByUserId are required"
        ),
        { status: 400 }
      );
    }

    const updatedHousehold = HouseholdService.removeMember(
      householdId,
      memberUserId,
      requestedByUserId
    );
    return Response.json(createSuccessResponse(updatedHousehold));
  } catch (error) {
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Failed to remove member"
      ),
      { status: 400 }
    );
  }
}
