import { ServiceCatalogManager } from "@/src/modules/services/service-catalog";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { ZodError } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return Response.json(
      createErrorResponse("VALIDATION_FAILED", "Missing tenantId query parameter"),
      { status: 400 }
    );
  }

  const services = await ServiceCatalogManager.listServicesByTenant(tenantId);
  return Response.json(createSuccessResponse(services));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service = await ServiceCatalogManager.createService(body);
    return Response.json(createSuccessResponse(service), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMsg = error.issues[0]?.message || "Validation failed";
      return Response.json(createErrorResponse("VALIDATION_FAILED", errorMsg), { status: 400 });
    }
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Internal Server Error"
      ),
      { status: 500 }
    );
  }
}
