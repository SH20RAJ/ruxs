import { VacationService } from "@/src/modules/vacation/vacation-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as { action: "resume_early" | "extend"; newEndDate?: string };

    let updated;
    if (body.action === "resume_early") {
      updated = await VacationService.resumeEarly(id);
    } else if (body.action === "extend" && body.newEndDate) {
      updated = await VacationService.extendVacation(id, body.newEndDate);
    } else {
      return Response.json(
        createErrorResponse("VALIDATION_FAILED", "Invalid vacation action"),
        { status: 400 }
      );
    }

    return Response.json(createSuccessResponse(updated));
  } catch (error) {
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Failed to update vacation"
      ),
      { status: 400 }
    );
  }
}
