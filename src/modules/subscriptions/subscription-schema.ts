import { z } from "zod";
import { Paise } from "../../shared/types/money";

export const SubscriptionCadenceEnum = z.enum([
  "DAILY",
  "WEEKDAYS",
  "ALTERNATE_DAYS",
  "SELECTED_DAYS",
]);

export const SubscriptionStatusEnum = z.enum([
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
]);

export const AutopilotDefaultEnum = z.enum([
  "CONFIRMED", // Default to delivering unless explicitly skipped
  "SKIPPED",   // Default to skipped unless explicitly confirmed
]);

export const CreateSubscriptionSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  householdId: z.string().optional(),
  productId: z.string().min(1, "Product ID is required"),
  productName: z.string().min(1),
  unitPricePaise: z.number().int().positive(),
  cadence: SubscriptionCadenceEnum.default("DAILY"),
  selectedDays: z.array(z.number().int().min(1).max(7)).optional(), // 1=Monday, 7=Sunday (ISO)
  defaultQuantity: z.number().int().positive().default(1),
  autopilotDefault: AutopilotDefaultEnum.default("CONFIRMED"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional(),
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;

export interface Subscription {
  id: string;
  tenantId: string;
  customerId: string;
  householdId?: string;
  productId: string;
  productName: string;
  unitPricePaise: Paise;
  cadence: z.infer<typeof SubscriptionCadenceEnum>;
  selectedDays?: number[];
  defaultQuantity: number;
  autopilotDefault: z.infer<typeof AutopilotDefaultEnum>;
  status: z.infer<typeof SubscriptionStatusEnum>;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}
