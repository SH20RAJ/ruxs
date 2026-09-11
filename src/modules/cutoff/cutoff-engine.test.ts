import { describe, it, expect, beforeEach } from "bun:test";
import { CutoffEngine } from "./cutoff-engine";
import { FulfillmentStateMachine } from "../fulfillment/fulfillment-fsm";
import { DailyFulfillment } from "../fulfillment/fulfillment-schema";
import { Paise } from "../../shared/types/money";

describe("Cutoff Engine & Kitchen Batch Counter", () => {
  beforeEach(() => {
    FulfillmentStateMachine.clearStore();
  });

  it("locks expired cutoffs: auto-confirms pending polls and progresses confirmed to IN_PREPARATION", () => {
    const tenantId = "ten_sharma_tiffin";
    const date = "2026-09-12";
    const cutoffTime = "2026-09-12T10:00:00.000Z";

    // Item 1: Pending WhatsApp poll
    const f1: DailyFulfillment = {
      id: "ful_1",
      tenantId,
      subscriptionId: "sub_1",
      customerId: "usr_1",
      serviceDate: date,
      shift: "LUNCH",
      status: "CONFIRMATION_REQUIRED",
      items: [
        {
          productId: "prd_thali",
          productName: "Veg Thali",
          quantity: 1,
          unitPricePaise: 12000 as Paise,
          totalPricePaise: 12000 as Paise,
        },
      ],
      totalPricePaise: 12000 as Paise,
      cutoffTime,
      createdAt: "2026-09-12T00:01:00Z",
      updatedAt: "2026-09-12T00:01:00Z",
    };

    // Item 2: Customer confirmed earlier
    const f2: DailyFulfillment = {
      id: "ful_2",
      tenantId,
      subscriptionId: "sub_2",
      customerId: "usr_2",
      serviceDate: date,
      shift: "LUNCH",
      status: "CONFIRMED",
      items: [
        {
          productId: "prd_thali",
          productName: "Veg Thali",
          quantity: 2,
          unitPricePaise: 12000 as Paise,
          totalPricePaise: 24000 as Paise,
        },
      ],
      totalPricePaise: 24000 as Paise,
      cutoffTime,
      createdAt: "2026-09-12T00:01:00Z",
      updatedAt: "2026-09-12T00:01:00Z",
    };

    FulfillmentStateMachine.save(f1);
    FulfillmentStateMachine.save(f2);

    // Simulate sweep at 10:01 AM (1 minute past cutoff)
    const result = CutoffEngine.lockExpiredCutoffs(tenantId, date, "2026-09-12T10:01:00.000Z");
    expect(result.lockedCount).toBe(2);

    // After sweep, f1 should be auto-confirmed
    const savedF1 = FulfillmentStateMachine.getById("ful_1");
    expect(savedF1?.status).toBe("CONFIRMED");

    // f2 should be in kitchen prep
    const savedF2 = FulfillmentStateMachine.getById("ful_2");
    expect(savedF2?.status).toBe("IN_PREPARATION");
  });

  it("calculates live kitchen batch counters and SKU production breakdown", () => {
    const tenantId = "ten_sharma_tiffin";
    const date = "2026-09-12";
    const cutoffTime = "2026-09-12T10:00:00.000Z";

    // F1: 1x Thali (Confirmed)
    FulfillmentStateMachine.save({
      id: "ful_1",
      tenantId,
      subscriptionId: "sub_1",
      customerId: "usr_1",
      serviceDate: date,
      shift: "LUNCH",
      status: "CONFIRMED",
      items: [
        {
          productId: "prd_thali",
          productName: "Veg Thali",
          quantity: 1,
          unitPricePaise: 12000 as Paise,
          totalPricePaise: 12000 as Paise,
        },
      ],
      totalPricePaise: 12000 as Paise,
      cutoffTime,
      createdAt: "2026-09-12T00:01:00Z",
      updatedAt: "2026-09-12T00:01:00Z",
    });

    // F2: 2x Thali (In Prep)
    FulfillmentStateMachine.save({
      id: "ful_2",
      tenantId,
      subscriptionId: "sub_2",
      customerId: "usr_2",
      serviceDate: date,
      shift: "LUNCH",
      status: "IN_PREPARATION",
      items: [
        {
          productId: "prd_thali",
          productName: "Veg Thali",
          quantity: 2,
          unitPricePaise: 12000 as Paise,
          totalPricePaise: 24000 as Paise,
        },
      ],
      totalPricePaise: 24000 as Paise,
      cutoffTime,
      createdAt: "2026-09-12T00:01:00Z",
      updatedAt: "2026-09-12T00:01:00Z",
    });

    // F3: 1x Thali (Skipped by customer)
    FulfillmentStateMachine.save({
      id: "ful_3",
      tenantId,
      subscriptionId: "sub_3",
      customerId: "usr_3",
      serviceDate: date,
      shift: "LUNCH",
      status: "SKIPPED",
      items: [
        {
          productId: "prd_thali",
          productName: "Veg Thali",
          quantity: 1,
          unitPricePaise: 12000 as Paise,
          totalPricePaise: 12000 as Paise,
        },
      ],
      totalPricePaise: 12000 as Paise,
      cutoffTime,
      createdAt: "2026-09-12T00:01:00Z",
      updatedAt: "2026-09-12T00:01:00Z",
    });

    const batch = CutoffEngine.getKitchenBatchCounter(tenantId, date, "LUNCH");
    expect(batch.totalConfirmed).toBe(1);
    expect(batch.totalInPrep).toBe(1);
    expect(batch.totalSkipped).toBe(1);
    // Kitchen production must only cook for confirmed + in_prep: 1 + 2 = 3 meals
    expect(batch.skuBreakdown["prd_thali"].quantity).toBe(3);
    expect(batch.skuBreakdown["prd_thali"].totalPaise).toBe(36000 as Paise);
  });
});
