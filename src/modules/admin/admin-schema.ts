import { z } from "zod";

export const VendorApprovalStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "VERIFIED",
  "SUSPENDED",
]);

export type VendorApprovalStatus = z.infer<typeof VendorApprovalStatusSchema>;

export const VendorPlanTierSchema = z.enum([
  "STARTER",
  "GROWTH",
  "PRO",
]);

export type VendorPlanTier = z.infer<typeof VendorPlanTierSchema>;

export const PlatformAuditActionSchema = z.enum([
  "VENDOR_APPROVED",
  "VENDOR_SUSPENDED",
  "PLAN_UPGRADED",
  "DISPUTE_ESCALATED",
  "SETTING_CHANGED",
]);

export type PlatformAuditAction = z.infer<typeof PlatformAuditActionSchema>;

export const PlatformAuditLogSchema = z.object({
  id: z.string(),
  adminUserId: z.string(),
  adminEmail: z.string(),
  action: PlatformAuditActionSchema,
  targetType: z.string(),
  targetId: z.string(),
  details: z.string(),
  ipAddress: z.string().optional(),
  createdAt: z.string(),
});

export type PlatformAuditLog = z.infer<typeof PlatformAuditLogSchema>;

export const AdminVendorProfileSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  slug: z.string(),
  phone: z.string(),
  serviceCategories: z.array(z.string()),
  coveredSocieties: z.array(z.string()),
  status: VendorApprovalStatusSchema.default("PENDING_VERIFICATION"),
  tier: VendorPlanTierSchema.default("STARTER"),
  subscriberCount: z.number().int().nonnegative().default(0),
  monthlyVolumePaise: z.number().int().nonnegative().default(0),
  verifiedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdminVendorProfile = z.infer<typeof AdminVendorProfileSchema>;
