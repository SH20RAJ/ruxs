import { z } from "zod";

export const VacationStatusEnum = z.enum([
  "ACTIVE",
  "EARLY_RESUMED",
  "CANCELLED",
]);

export interface VacationPause {
  id: string;
  customerId: string;
  householdId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  subscriptionIds: string[]; // List of subscription IDs paused, or empty for "ALL"
  reason?: string;
  status: z.infer<typeof VacationStatusEnum>;
  createdAt: string;
  resumedAt?: string;
}

export const CreateVacationSchema = z.object({
  customerId: z.string().min(1),
  householdId: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  subscriptionIds: z.array(z.string()).default([]),
  reason: z.string().max(200).optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export type CreateVacationInput = z.infer<typeof CreateVacationSchema>;
