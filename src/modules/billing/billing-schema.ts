import { z } from "zod";
import { Paise } from "../../shared/types/money";

export const InvoiceStatusEnum = z.enum([
  "DRAFT",
  "ISSUED",
  "PARTIALLY_PAID",
  "PAID",
  "VOID",
]);

export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPricePaise: Paise;
  totalPaise: Paise;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., INV-2026-09-001
  tenantId: string;
  customerId: string;
  householdId?: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  dueDate: string;     // YYYY-MM-DD
  items: InvoiceItem[];
  subtotalPaise: Paise;
  previousBalancePaise: Paise;
  discountPaise: Paise;
  taxPaise: Paise;
  totalAmountDuePaise: Paise;
  amountPaidPaise: Paise;
  status: InvoiceStatus;
  createdAt: string;
  paidAt?: string;
}

export const GenerateInvoiceSchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  discountPaise: z.number().int().min(0).default(0),
});

export type GenerateInvoiceInput = z.infer<typeof GenerateInvoiceSchema>;
