import { VacationService } from "@/src/modules/vacation/vacation-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const vacation = await VacationService.createVacation(body);
    return Response.json(createSuccessResponse(vacation), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const msg = error.issues[0]?.message || "Validation failed";
      return Response.json(createErrorResponse("VALIDATION_FAILED", msg), { status: 400 });
    }
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Failed to create vacation pause"
      ),
      { status: 500 }
    );
  }
}
