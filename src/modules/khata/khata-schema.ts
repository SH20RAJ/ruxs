import { z } from "zod";
import { Paise } from "../../shared/types/money";

export const KhataEntryTypeEnum = z.enum([
  "FULFILLMENT_DEBIT",
  "LATE_FEE_DEBIT",
  "PAYMENT_CREDIT",
  "DISCOUNT_CREDIT",
  "REFUND_CREDIT",
  "ASSET_DEPOSIT_DEBIT",
]);

export type KhataEntryType = z.infer<typeof KhataEntryTypeEnum>;

export const KhataDirectionEnum = z.enum(["DEBIT", "CREDIT"]);
export type KhataDirection = z.infer<typeof KhataDirectionEnum>;

export interface KhataEntry {
  id: string;
  tenantId: string;
  customerId: string;
  householdId?: string;
  entryType: KhataEntryType;
  direction: KhataDirection;
  amountPaise: Paise;
  runningBalancePaise: Paise; // Running balance after this entry (positive = customer owes vendor)
  referenceType?: "FULFILLMENT" | "PAYMENT" | "DISPUTE" | "MANUAL";
  referenceId?: string;
  description: string;
  createdAt: string;
}

export const CreateKhataEntrySchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
  householdId: z.string().optional(),
  entryType: KhataEntryTypeEnum,
  direction: KhataDirectionEnum,
  amountPaise: z.number().int().positive("Amount must be positive integer Paise"),
  referenceType: z.enum(["FULFILLMENT", "PAYMENT", "DISPUTE", "MANUAL"]).optional(),
  referenceId: z.string().optional(),
  description: z.string().min(2).max(255),
});

export type CreateKhataEntryInput = z.infer<typeof CreateKhataEntrySchema>;
