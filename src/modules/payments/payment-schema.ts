import { z } from "zod";
import { Paise } from "../../shared/types/money";

export const PaymentMethodEnum = z.enum([
  "UPI_INTENT",
  "UPI_QR",
  "CASH",
  "NET_BANKING",
]);

export const PaymentStatusEnum = z.enum([
  "CREATED",
  "INITIATED",
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
]);

export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export interface PaymentRecord {
  id: string;
  tenantId: string;
  customerId: string;
  invoiceId?: string;
  amountPaise: Paise;
  method: z.infer<typeof PaymentMethodEnum>;
  status: PaymentStatus;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  bankUtr?: string;
  khataEntryId?: string;
  upiDeepLink?: string;
  qrPayload?: string;
  settledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const CreatePaymentOrderSchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
  invoiceId: z.string().optional(),
  amountPaise: z.number().int().positive(),
  recipientUpiId: z.string().min(3),
  recipientName: z.string().min(1),
});

export type CreatePaymentOrderInput = z.infer<typeof CreatePaymentOrderSchema>;
