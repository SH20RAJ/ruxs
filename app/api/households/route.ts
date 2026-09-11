import { HouseholdService } from "@/src/modules/households/household-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const householdId = searchParams.get("householdId");
  const userId = searchParams.get("userId");

  if (householdId) {
    const household = await HouseholdService.getHouseholdAsync(householdId);
    if (!household) {
      return Response.json(
        createErrorResponse("NOT_FOUND", `Household ${householdId} not found`),
        { status: 404 }
      );
    }
    return Response.json(createSuccessResponse(household));
  }

  if (userId) {
    const household = await HouseholdService.getHouseholdForUserAsync(userId);
    if (!household) {
      return Response.json(
        createErrorResponse("NOT_FOUND", `No household found for user ${userId}`),
        { status: 404 }
      );
    }
    return Response.json(createSuccessResponse(household));
  }

  return Response.json(
    createErrorResponse("VALIDATION_FAILED", "householdId or userId is required"),
    { status: 400 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const household = HouseholdService.createHousehold(body);
    return Response.json(createSuccessResponse(household), { status: 201 });
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
