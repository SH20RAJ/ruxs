import { ExpenseSplitter } from "@/src/modules/expenses/expense-splitter";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const householdId = searchParams.get("householdId");

  if (!householdId) {
    return Response.json(
      createErrorResponse("VALIDATION_FAILED", "householdId is required"),
      { status: 400 }
    );
  }

  const list = await ExpenseSplitter.listByHouseholdAsync(householdId);
  return Response.json(createSuccessResponse(list));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const expense = ExpenseSplitter.createExpense(body);
    return Response.json(createSuccessResponse(expense), { status: 201 });
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
