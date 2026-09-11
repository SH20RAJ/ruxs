import { z } from "zod";
import { Paise } from "../../shared/types/money";

export const FulfillmentStateEnum = z.enum([
  "SCHEDULED",
  "CONFIRMATION_REQUIRED",
  "CONFIRMED",
  "SKIPPED",
  "LATE_SKIP",
  "IN_PREPARATION",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "DISPUTED",
  "CANCELLED",
]);

export type FulfillmentState = z.infer<typeof FulfillmentStateEnum>;

export const ShiftEnum = z.enum(["MORNING", "LUNCH", "EVENING", "NIGHT"]);

export interface FulfillmentItemSnapshot {
  productId: string;
  productName: string;
  quantity: number;
  unitPricePaise: Paise;
  totalPricePaise: Paise;
}

export interface DailyFulfillment {
  id: string;
  tenantId: string;
  subscriptionId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  householdId?: string;
  addressSummary?: string;
  serviceDate: string; // YYYY-MM-DD
  shift: z.infer<typeof ShiftEnum>;
  status: FulfillmentState;
  items: FulfillmentItemSnapshot[];
  totalPricePaise: Paise;
  lateFeePaise?: Paise;
  cutoffTime: string; // ISO String or "HH:MM"
  deliveredAt?: string;
  notes?: string;
  khataEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

export const TransitionActionSchema = z.object({
  action: z.enum([
    "REQUEST_CONFIRMATION",
    "CONFIRM",
    "SKIP",
    "START_PREP",
    "DISPATCH",
    "MARK_DELIVERED",
    "MARK_FAILED",
    "DISPUTE",
    "CANCEL",
  ]),
  actionTime: z.string().optional(), // ISO Date string for simulation/testing
  notes: z.string().optional(),
  driverId: z.string().optional(),
});

export type TransitionAction = z.infer<typeof TransitionActionSchema>;
