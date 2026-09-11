import {
  NotificationRecord,
  DispatchNotificationInput,
  DispatchNotificationSchema,
} from "./notification-schema";

const notificationStore: NotificationRecord[] = [];

export class NotificationService {
  /**
   * Compiles notification text from event type and dynamic parameters
   */
  static compileTemplate(eventType: string, params: Record<string, any>): { title: string; body: string } {
    switch (eventType) {
      case "DAILY_POLL":
        return {
          title: "🍱 RUXS Daily Service Poll",
          body: `Hi ${params.name || "there"}, delivering your ${params.serviceName || "tiffin"} today? Cutoff is at ${params.cutoffTime || "10:00 AM"}. Tap below to Skip or Confirm.`,
        };
      case "OUT_FOR_DELIVERY":
        return {
          title: "🚀 Delivery En Route",
          body: `Your ${params.serviceName || "order"} is out for delivery with driver ${params.driverName || "assigned to your route"}.`,
        };
      case "DELIVERED":
        return {
          title: "✅ Doorstep Delivery Complete",
          body: `Your ${params.serviceName || "service"} was delivered to ${params.address || "your door"}. Added to your Khata ledger.`,
        };
      case "INVOICE_GENERATED":
        return {
          title: "🧾 Monthly Statement Ready",
          body: `Your statement for ${params.month || "this month"} of ₹${params.amountRupees || "0"} is ready. Pay seamlessly via UPI.`,
        };
      case "PAYMENT_RECEIVED":
        return {
          title: "💚 Payment Confirmed",
          body: `Received ₹${params.amountRupees || "0"} via UPI. Your Khata ledger balance has been updated.`,
        };
      default:
        return {
          title: "RUXS Alert",
          body: "You have a new update regarding your household services.",
        };
    }
  }

  /**
   * Checks whether the current time falls inside quiet hours (10:00 PM to 07:00 AM IST)
   */
  static isQuietHours(timeDate: Date = new Date()): boolean {
    // 10:00 PM = 22, 7:00 AM = 7
    const hours = timeDate.getHours();
    return hours >= 22 || hours < 7;
  }

  /**
   * Dispatches a notification across the priority channel stack:
   * WhatsApp (if opted-in and provider available) -> Web Push -> DLT SMS Fallback
   */
  static async dispatchNotification(rawInput: unknown): Promise<NotificationRecord> {
    const validated = DispatchNotificationSchema.parse(rawInput);
    const { title, body } = this.compileTemplate(validated.eventType, validated.params);

    const now = validated.scheduledTime ? new Date(validated.scheduledTime) : new Date();

    // Check quiet hours for non-urgent notifications (Invoices)
    if (validated.eventType === "INVOICE_GENERATED" && this.isQuietHours(now)) {
      throw new Error("Cannot dispatch non-urgent billing notification during quiet hours (10 PM - 7 AM)");
    }

    const notifId = `not_${Math.random().toString(36).substring(2, 11)}`;

    let primaryChannel: "WHATSAPP" | "SMS" = "WHATSAPP";
    let fallbackChannel: "SMS" | undefined = undefined;
    let status: "SENT" | "FALLBACK_TRIGGERED" = "SENT";

    // If user has not opted into WhatsApp, route directly to SMS
    if (!validated.whatsappOptIn) {
      primaryChannel = "SMS";
    }

    const record: NotificationRecord = {
      id: notifId,
      tenantId: validated.tenantId,
      customerId: validated.customerId,
      recipientPhone: validated.recipientPhone,
      channel: primaryChannel,
      eventType: validated.eventType,
      title,
      body,
      status,
      fallbackChannel,
      metadata: validated.params,
      createdAt: now.toISOString(),
    };

    notificationStore.push(record);
    return record;
  }

  /**
   * Simulates a delivery failure on primary WhatsApp channel triggering automatic SMS fallback
   */
  static async triggerFallback(notificationId: string): Promise<NotificationRecord> {
    const notif = notificationStore.find((n) => n.id === notificationId);
    if (!notif) throw new Error("Notification not found");

    notif.status = "FALLBACK_TRIGGERED";
    notif.fallbackChannel = "SMS";
    return notif;
  }

  static getFeedForCustomer(customerId: string): NotificationRecord[] {
    return notificationStore.filter((n) => n.customerId === customerId);
  }

  static clearStore(): void {
    notificationStore.length = 0;
  }
}
