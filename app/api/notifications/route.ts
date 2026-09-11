import { NotificationService } from "@/src/modules/notifications/notification-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return Response.json(
      createErrorResponse("VALIDATION_FAILED", "customerId is required"),
      { status: 400 }
    );
  }

  const feed = NotificationService.getFeedForCustomer(customerId);
  return Response.json(createSuccessResponse(feed));
}
