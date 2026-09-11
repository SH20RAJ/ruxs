import { describe, it, expect, beforeEach } from "bun:test";
import { FulfillmentStateMachine } from "./fulfillment-fsm";
import { FulfillmentGenerator } from "./fulfillment-generator";
import { DailyFulfillment } from "./fulfillment-schema";
import { Subscription } from "../subscriptions/subscription-schema";
import { Paise } from "../../shared/types/money";

describe("Daily Fulfillment FSM & Overnight Generator", () => {
  beforeEach(() => {
    FulfillmentStateMachine.clearStore();
  });

  const mockSubscriptions: Subscription[] = [
    {
      id: "sub_1",
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_priya",
      productId: "prd_thali",
      productName: "Standard Veg Thali",
      unitPricePaise: 12000 as Paise,
      cadence: "DAILY",
      defaultQuantity: 1,
      autopilotDefault: "CONFIRMED",
      status: "ACTIVE",
      startDate: "2026-09-01",
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    },
    {
      id: "sub_2",
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_rahul",
      productId: "prd_thali",
      productName: "Standard Veg Thali",
      unitPricePaise: 12000 as Paise,
      cadence: "WEEKDAYS",
      defaultQuantity: 2,
      autopilotDefault: "CONFIRMED",
      status: "ACTIVE",
      startDate: "2026-09-01",
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    },
    {
      id: "sub_3_paused",
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_vacationer",
      productId: "prd_thali",
      productName: "Standard Veg Thali",
      unitPricePaise: 12000 as Paise,
      cadence: "DAILY",
      defaultQuantity: 1,
      autopilotDefault: "CONFIRMED",
      status: "PAUSED",
      startDate: "2026-09-01",
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    },
  ];

  it("generates daily fulfillments for scheduled subscriptions with frozen price snapshots", () => {
    // 2026-09-04 is a Friday -> sub_1 and sub_2 should generate; sub_3 is paused
    const generated = FulfillmentGenerator.generateForDate(mockSubscriptions, {
      serviceDate: "2026-09-04",
      cutoffTimeStr: "10:00",
      shift: "LUNCH",
    });

    expect(generated).toHaveLength(2);
    expect(generated[0].status).toBe("CONFIRMED");
    expect(generated[0].totalPricePaise).toBe(12000 as Paise);
    expect(generated[1].totalPricePaise).toBe(24000 as Paise); // 2 * 12000
    expect(generated[0].items[0].productName).toBe("Standard Veg Thali");
  });

  it("progresses fulfillment through the standard happy path: CONFIRMED -> PREP -> DISPATCH -> DELIVERED", () => {
    const fulfillment: DailyFulfillment = {
      id: "ful_test_1",
      tenantId: "ten_sharma_tiffin",
      subscriptionId: "sub_1",
      customerId: "usr_priya",
      serviceDate: "2026-09-12",
      shift: "LUNCH",
      status: "CONFIRMED",
      items: [],
      totalPricePaise: 12000 as Paise,
      cutoffTime: "2026-09-12T10:00:00.000Z",
      createdAt: "2026-09-12T00:01:00.000Z",
      updatedAt: "2026-09-12T00:01:00.000Z",
    };

    // 1. Kitchen prep
    FulfillmentStateMachine.transition(fulfillment, { action: "START_PREP" });
    expect(fulfillment.status).toBe("IN_PREPARATION");

    // 2. Dispatch to driver
    FulfillmentStateMachine.transition(fulfillment, { action: "DISPATCH" });
    expect(fulfillment.status).toBe("OUT_FOR_DELIVERY");

    // 3. Driver delivers
    FulfillmentStateMachine.transition(fulfillment, { action: "MARK_DELIVERED" });
    expect(fulfillment.status).toBe("DELIVERED");
    expect(fulfillment.deliveredAt).toBeDefined();

    // Idempotency: re-tapping delivered does not fail
    FulfillmentStateMachine.transition(fulfillment, { action: "MARK_DELIVERED" });
    expect(fulfillment.status).toBe("DELIVERED");
  });

  it("enforces cutoff guard: permits normal skip before cutoff, forces LATE_SKIP with fee after cutoff", () => {
    const cutoffTime = "2026-09-12T10:00:00.000Z";

    // Scenario A: Customer skips at 09:15 AM (Before cutoff)
    const earlyFulfillment: DailyFulfillment = {
      id: "ful_early",
      tenantId: "ten_sharma_tiffin",
      subscriptionId: "sub_1",
      customerId: "usr_priya",
      serviceDate: "2026-09-12",
      shift: "LUNCH",
      status: "CONFIRMED",
      items: [],
      totalPricePaise: 12000 as Paise,
      cutoffTime,
      createdAt: "2026-09-12T00:01:00.000Z",
      updatedAt: "2026-09-12T00:01:00.000Z",
    };

    FulfillmentStateMachine.transition(earlyFulfillment, {
      action: "SKIP",
      actionTime: "2026-09-12T09:15:00.000Z",
    });
    expect(earlyFulfillment.status).toBe("SKIPPED");
    expect(earlyFulfillment.lateFeePaise).toBe(0 as Paise);

    // Scenario B: Customer skips at 10:15 AM (After cutoff)
    const lateFulfillment: DailyFulfillment = {
      id: "ful_late",
      tenantId: "ten_sharma_tiffin",
      subscriptionId: "sub_1",
      customerId: "usr_priya",
      serviceDate: "2026-09-12",
      shift: "LUNCH",
      status: "CONFIRMED",
      items: [],
      totalPricePaise: 12000 as Paise,
      cutoffTime,
      createdAt: "2026-09-12T00:01:00.000Z",
      updatedAt: "2026-09-12T00:01:00.000Z",
    };

    FulfillmentStateMachine.transition(lateFulfillment, {
      action: "SKIP",
      actionTime: "2026-09-12T10:15:00.000Z",
    });
    expect(lateFulfillment.status).toBe("LATE_SKIP");
    expect(lateFulfillment.lateFeePaise).toBe(6000 as Paise); // 50% of 12000
  });

  it("rejects invalid state transitions", () => {
    const fulfillment: DailyFulfillment = {
      id: "ful_invalid",
      tenantId: "ten_sharma_tiffin",
      subscriptionId: "sub_1",
      customerId: "usr_priya",
      serviceDate: "2026-09-12",
      shift: "LUNCH",
      status: "DELIVERED",
      items: [],
      totalPricePaise: 12000 as Paise,
      cutoffTime: "2026-09-12T10:00:00.000Z",
      createdAt: "2026-09-12T00:01:00.000Z",
      updatedAt: "2026-09-12T00:01:00.000Z",
    };

    // Delivered cannot be cancelled directly (must be disputed)
    expect(() =>
      FulfillmentStateMachine.transition(fulfillment, { action: "CANCEL" })
    ).toThrow();

    // Delivered cannot jump back to prep
    expect(() =>
      FulfillmentStateMachine.transition(fulfillment, { action: "START_PREP" })
    ).toThrow();
  });
});
