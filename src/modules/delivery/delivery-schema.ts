import { z } from "zod";

export const DeliveryStopStatusSchema = z.enum([
  "PENDING",
  "DELIVERED",
  "FAILED",
  "SKIPPED",
]);

export type DeliveryStopStatus = z.infer<typeof DeliveryStopStatusSchema>;

export const DeliveryDropPreferenceSchema = z.enum([
  "DOORSTEP",
  "SECURITY_GATE",
  "NEIGHBOR",
  "HANDOVER",
]);

export type DeliveryDropPreference = z.infer<typeof DeliveryDropPreferenceSchema>;

export const DeliveryStopSchema = z.object({
  id: z.string(),
  fulfillmentId: z.string(),
  tenantId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  society: z.string(),
  tower: z.string(),
  floor: z.number().int().nonnegative(),
  flat: z.string(),
  serviceName: z.string(),
  quantity: z.number().int().positive(),
  status: DeliveryStopStatusSchema.default("PENDING"),
  dropPreference: DeliveryDropPreferenceSchema.default("DOORSTEP"),
  assetCollected: z.number().int().nonnegative().optional(),
  assetDelivered: z.number().int().nonnegative().optional(),
  deliveredAt: z.string().optional(),
  failureReason: z.string().optional(),
  notes: z.string().optional(),
});

export type DeliveryStop = z.infer<typeof DeliveryStopSchema>;

export const DeliveryRunSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  driverId: z.string(),
  driverName: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shift: z.enum(["MORNING", "LUNCH", "EVENING"]),
  stops: z.array(DeliveryStopSchema),
  totalStops: z.number().int().nonnegative(),
  completedStops: z.number().int().nonnegative(),
  skippedStops: z.number().int().nonnegative(),
  failedStops: z.number().int().nonnegative(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DeliveryRun = z.infer<typeof DeliveryRunSchema>;

export const GenerateRunSheetInputSchema = z.object({
  tenantId: z.string(),
  driverId: z.string(),
  driverName: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shift: z.enum(["MORNING", "LUNCH", "EVENING"]),
  items: z.array(
    z.object({
      fulfillmentId: z.string(),
      customerId: z.string(),
      customerName: z.string(),
      customerPhone: z.string(),
      society: z.string(),
      tower: z.string(),
      floor: z.number().int().nonnegative(),
      flat: z.string(),
      serviceName: z.string(),
      quantity: z.number().int().positive(),
      isSkipped: z.boolean().optional(),
      dropPreference: DeliveryDropPreferenceSchema.optional(),
      notes: z.string().optional(),
    })
  ),
});

export type GenerateRunSheetInput = z.infer<typeof GenerateRunSheetInputSchema>;
