import { describe, it, expect, beforeEach } from "bun:test";
import { SubscriptionEngine } from "./subscription-engine";

describe("Recurring Subscription Engine", () => {
  beforeEach(() => {
    SubscriptionEngine.clearStore();
  });

  it("creates an active daily subscription and evaluates daily delivery", async () => {
    const sub = await SubscriptionEngine.createSubscription({
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_priya",
      productId: "prd_thali",
      productName: "Standard Veg Thali",
      unitPricePaise: 12000,
      cadence: "DAILY",
      defaultQuantity: 1,
      autopilotDefault: "CONFIRMED",
      startDate: "2026-09-01",
    });

    expect(sub.id).toStartWith("sub_");
    expect(sub.status).toBe("ACTIVE");

    // Evaluates scheduled on any day on/after start date
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-01")).toBe(true);
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-15")).toBe(true);
    // Before start date is not scheduled
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-08-31")).toBe(false);
  });

  it("evaluates WEEKDAYS cadence (Mon-Fri only)", async () => {
    const sub = await SubscriptionEngine.createSubscription({
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_office_worker",
      productId: "prd_thali",
      productName: "Office Lunch Thali",
      unitPricePaise: 12000,
      cadence: "WEEKDAYS",
      startDate: "2026-09-01", // Tuesday
    });

    // 2026-09-04 is Friday (Day 5) -> Scheduled
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-04")).toBe(true);
    // 2026-09-05 is Saturday (Day 6) -> Not scheduled
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-05")).toBe(false);
    // 2026-09-06 is Sunday (Day 7) -> Not scheduled
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-06")).toBe(false);
    // 2026-09-07 is Monday (Day 1) -> Scheduled
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-07")).toBe(true);
  });

  it("evaluates ALTERNATE_DAYS cadence correctly", async () => {
    const sub = await SubscriptionEngine.createSubscription({
      tenantId: "ten_kaveri_water",
      customerId: "usr_priya",
      productId: "prd_water_jar",
      productName: "20L Water Jar",
      unitPricePaise: 4000,
      cadence: "ALTERNATE_DAYS",
      startDate: "2026-09-01", // Day 0
    });

    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-01")).toBe(true); // Day 0
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-02")).toBe(false); // Day 1
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-03")).toBe(true); // Day 2
    expect(SubscriptionEngine.isScheduledOnDate(sub, "2026-09-04")).toBe(false); // Day 3
  });

  it("handles pause, resume, and cancellation state transitions", async () => {
    const sub = await SubscriptionEngine.createSubscription({
      tenantId: "ten_milk",
      customerId: "usr_priya",
      productId: "prd_milk_1l",
      productName: "1L Cow Milk",
      unitPricePaise: 6500,
      cadence: "DAILY",
      startDate: "2026-09-01",
    });

    // Pause
    const paused = await SubscriptionEngine.pauseSubscription(sub.id);
    expect(paused.status).toBe("PAUSED");
    // Paused subscriptions are NOT scheduled
    expect(SubscriptionEngine.isScheduledOnDate(paused, "2026-09-02")).toBe(false);

    // Resume
    const resumed = await SubscriptionEngine.resumeSubscription(sub.id);
    expect(resumed.status).toBe("ACTIVE");
    expect(SubscriptionEngine.isScheduledOnDate(resumed, "2026-09-02")).toBe(true);

    // Cancel
    const cancelled = await SubscriptionEngine.cancelSubscription(sub.id);
    expect(cancelled.status).toBe("CANCELLED");
    expect(SubscriptionEngine.isScheduledOnDate(cancelled, "2026-09-03")).toBe(false);
  });
});
