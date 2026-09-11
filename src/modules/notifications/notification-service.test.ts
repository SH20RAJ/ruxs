import { describe, it, expect, beforeEach } from "bun:test";
import { NotificationService } from "./notification-service";

describe("Multi-Channel Notification Engine", () => {
  beforeEach(() => {
    NotificationService.clearStore();
  });

  it("dispatches morning cutoff poll over WhatsApp to opted-in customer", async () => {
    const notif = await NotificationService.dispatchNotification({
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_priya",
      recipientPhone: "+919876543210",
      eventType: "DAILY_POLL",
      whatsappOptIn: true,
      params: {
        name: "Priya",
        serviceName: "Lunch Veg Thali",
        cutoffTime: "10:00 AM",
      },
    });

    expect(notif.id).toStartWith("not_");
    expect(notif.channel).toBe("WHATSAPP");
    expect(notif.title).toContain("Daily Service Poll");
    expect(notif.body).toContain("Cutoff is at 10:00 AM");
    expect(notif.status).toBe("SENT");
  });

  it("routes to SMS channel if customer opted out of WhatsApp", async () => {
    const notif = await NotificationService.dispatchNotification({
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_sms_user",
      recipientPhone: "+919876543210",
      eventType: "DELIVERED",
      whatsappOptIn: false,
      params: {
        serviceName: "Lunch Thali",
        address: "Flat 402 Door Handle",
      },
    });

    expect(notif.channel).toBe("SMS");
    expect(notif.body).toContain("Flat 402 Door Handle");
  });

  it("enforces quiet hours: rejects non-urgent invoice notifications late at night", async () => {
    // 11:30 PM (23:30)
    const lateNightDate = "2026-09-12T23:30:00";

    expect(
      NotificationService.dispatchNotification({
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_priya",
        recipientPhone: "+919876543210",
        eventType: "INVOICE_GENERATED",
        scheduledTime: lateNightDate,
        params: {
          month: "September",
          amountRupees: "3600",
        },
      })
    ).rejects.toThrow(/quiet hours/);
  });

  it("triggers automatic SMS fallback on primary channel delivery failure", async () => {
    const notif = await NotificationService.dispatchNotification({
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_priya",
      recipientPhone: "+919876543210",
      eventType: "OUT_FOR_DELIVERY",
      params: {
        driverName: "Ramesh",
      },
    });

    const fallback = await NotificationService.triggerFallback(notif.id);
    expect(fallback.status).toBe("FALLBACK_TRIGGERED");
    expect(fallback.fallbackChannel).toBe("SMS");
  });
});
