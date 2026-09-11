import { AdminService } from "@/src/modules/admin/admin-service";
import { createSuccessResponse } from "@/src/shared/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const logs = await AdminService.getAuditLogsAsync(limit);
  return Response.json(createSuccessResponse(logs));
}
