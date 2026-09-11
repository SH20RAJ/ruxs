import { AdminService } from "@/src/modules/admin/admin-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { z, ZodError } from "zod";

const VendorActionSchema = z.object({
  vendorId: z.string(),
  action: z.enum(["VERIFY", "SUSPEND", "CHANGE_TIER"]),
  tier: z.enum(["STARTER", "GROWTH", "PRO"]).optional(),
  reason: z.string().optional(),
  adminUser: z.object({
    userId: z.string(),
    email: z.string(),
  }),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  const vendors = await AdminService.listVendorsAsync(status);
  return Response.json(createSuccessResponse(vendors));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = VendorActionSchema.parse(body);

    if (validated.action === "VERIFY") {
      const vendor = AdminService.verifyVendor(validated.vendorId, validated.adminUser);
      return Response.json(createSuccessResponse(vendor));
    } else if (validated.action === "SUSPEND") {
      if (!validated.reason) {
        return Response.json(
          createErrorResponse("VALIDATION_FAILED", "Reason is required for suspension"),
          { status: 400 }
        );
      }
      const vendor = AdminService.suspendVendor(
        validated.vendorId,
        validated.reason,
        validated.adminUser
      );
      return Response.json(createSuccessResponse(vendor));
    } else if (validated.action === "CHANGE_TIER") {
      if (!validated.tier) {
        return Response.json(
          createErrorResponse("VALIDATION_FAILED", "Tier is required for CHANGE_TIER"),
          { status: 400 }
        );
      }
      const vendor = AdminService.updateVendorTier(
        validated.vendorId,
        validated.tier,
        validated.adminUser
      );
      return Response.json(createSuccessResponse(vendor));
    }

    return Response.json(createErrorResponse("VALIDATION_FAILED", "Unknown action"), {
      status: 400,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const msg = error.issues[0]?.message || "Validation failed";
      return Response.json(createErrorResponse("VALIDATION_FAILED", msg), { status: 400 });
    }
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Failed to execute admin action"
      ),
      { status: 400 }
    );
  }
}
