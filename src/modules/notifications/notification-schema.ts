import { z } from "zod";

export const NotificationChannelEnum = z.enum([
  "WHATSAPP",
  "WEB_PUSH",
  "SMS",
  "IN_APP",
]);

export const NotificationEventTypeEnum = z.enum([
  "DAILY_POLL",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "INVOICE_GENERATED",
  "PAYMENT_RECEIVED",
]);

export interface NotificationRecord {
  id: string;
  tenantId: string;
  customerId: string;
  recipientPhone: string;
  channel: z.infer<typeof NotificationChannelEnum>;
  eventType: z.infer<typeof NotificationEventTypeEnum>;
  title: string;
  body: string;
  actionUrl?: string;
  status: "SENT" | "FAILED" | "FALLBACK_TRIGGERED";
  fallbackChannel?: z.infer<typeof NotificationChannelEnum>;
  metadata?: Record<string, any>;
  createdAt: string;
}

export const DispatchNotificationSchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
  recipientPhone: z.string().min(10),
  eventType: NotificationEventTypeEnum,
  params: z.record(z.string(), z.any()),
  whatsappOptIn: z.boolean().default(true),
  scheduledTime: z.string().optional(), // For quiet hours testing
});

export type DispatchNotificationInput = z.infer<typeof DispatchNotificationSchema>;
