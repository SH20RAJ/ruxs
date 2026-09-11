import { DisputeService } from "@/src/modules/disputes/dispute-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const customerId = searchParams.get("customerId");
  const status = searchParams.get("status") || undefined;

  if (tenantId) {
    const list = await DisputeService.listByTenantAsync(tenantId, status);
    return Response.json(createSuccessResponse(list));
  }

  if (customerId) {
    const list = await DisputeService.listByCustomerAsync(customerId);
    return Response.json(createSuccessResponse(list));
  }

  return Response.json(
    createErrorResponse("VALIDATION_FAILED", "tenantId or customerId is required"),
    { status: 400 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dispute = DisputeService.fileDispute(body);
    return Response.json(createSuccessResponse(dispute), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const msg = error.issues[0]?.message || "Validation failed";
      return Response.json(createErrorResponse("VALIDATION_FAILED", msg), { status: 400 });
    }
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Failed to file dispute"
      ),
      { status: 400 }
    );
  }
}
