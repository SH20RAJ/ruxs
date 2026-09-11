import { z } from "zod";
import { Paise } from "../../shared/types/money";

export const DisputeReasonSchema = z.enum([
  "NOT_DELIVERED",
  "WRONG_ITEM",
  "DAMAGED_OR_LEAKING",
  "LATE_DELIVERY",
  "OVERCHARGED",
]);

export type DisputeReason = z.infer<typeof DisputeReasonSchema>;

export const DisputeStatusSchema = z.enum([
  "OPEN",
  "UNDER_REVIEW",
  "REFUNDED",
  "REJECTED",
]);

export type DisputeStatus = z.infer<typeof DisputeStatusSchema>;

export const DisputeEvidenceSchema = z.object({
  driverDeliveredAt: z.string().optional(),
  driverDropNotes: z.string().optional(),
  driverPhotoUrl: z.string().optional(),
  customerComment: z.string().min(3, "Customer explanation required"),
  customerPhotoUrl: z.string().optional(),
});

export type DisputeEvidence = z.infer<typeof DisputeEvidenceSchema>;

export const DisputeResolutionSchema = z.object({
  decision: z.enum(["FULL_REFUND", "PARTIAL_REFUND", "UPHELD_NO_REFUND"]),
  refundPaise: z.number().int().nonnegative(),
  resolutionNotes: z.string().min(3),
  resolvedBy: z.string(),
  resolvedAt: z.string(),
});

export type DisputeResolution = z.infer<typeof DisputeResolutionSchema>;

export const DisputeSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  fulfillmentId: z.string(),
  reason: DisputeReasonSchema,
  disputedAmountPaise: z.number().int().positive(),
  evidence: DisputeEvidenceSchema,
  status: DisputeStatusSchema.default("OPEN"),
  resolution: DisputeResolutionSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Dispute = z.infer<typeof DisputeSchema>;

export const FileDisputeInputSchema = z.object({
  tenantId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  fulfillmentId: z.string(),
  reason: DisputeReasonSchema,
  disputedAmountPaise: z.number().int().positive(),
  customerComment: z.string().min(3),
  customerPhotoUrl: z.string().optional(),
  driverDeliveredAt: z.string().optional(),
  driverDropNotes: z.string().optional(),
});

export type FileDisputeInput = z.infer<typeof FileDisputeInputSchema>;
