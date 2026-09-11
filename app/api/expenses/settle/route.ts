import { ExpenseSplitter } from "@/src/modules/expenses/expense-splitter";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { z, ZodError } from "zod";

const SettleDebtSchema = z.object({
  expenseId: z.string(),
  participantUserId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { expenseId, participantUserId } = SettleDebtSchema.parse(body);

    const updated = ExpenseSplitter.settleParticipantDebt(expenseId, participantUserId);
    return Response.json(createSuccessResponse(updated));
  } catch (error) {
    if (error instanceof ZodError) {
      const msg = error.issues[0]?.message || "Validation failed";
      return Response.json(createErrorResponse("VALIDATION_FAILED", msg), { status: 400 });
    }
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Failed to settle debt"
      ),
      { status: 400 }
    );
  }
}
