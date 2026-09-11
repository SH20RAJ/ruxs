import { describe, it, expect, beforeEach } from "bun:test";
import { VacationService } from "./vacation-service";
import { FulfillmentGenerator } from "../fulfillment/fulfillment-generator";
import { FulfillmentStateMachine } from "../fulfillment/fulfillment-fsm";
import { Subscription } from "../subscriptions/subscription-schema";
import { Paise } from "../../shared/types/money";

describe("Vacation Mode & Multi-Service Pauses", () => {
  beforeEach(() => {
    VacationService.clearStore();
    FulfillmentStateMachine.clearStore();
  });

  const mockSub: Subscription = {
    id: "sub_diwali",
    tenantId: "ten_sharma_tiffin",
    customerId: "usr_priya",
    productId: "prd_thali",
    productName: "Veg Thali",
    unitPricePaise: 12000 as Paise,
    cadence: "DAILY",
    defaultQuantity: 1,
    autopilotDefault: "CONFIRMED",
    status: "ACTIVE",
    startDate: "2026-09-01",
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  };

  it("suppresses fulfillment generation during active vacation dates", async () => {
    // Vacation from Sept 10 to Sept 15
    await VacationService.createVacation({
      customerId: "usr_priya",
      startDate: "2026-09-10",
      endDate: "2026-09-15",
      reason: "Visiting hometown for festival",
    });

    // Before vacation (Sept 9) -> Not paused, generates fulfillment
    expect(VacationService.isSubscriptionPausedOnDate("usr_priya", "sub_diwali", "2026-09-09")).toBe(false);
    const fulfillmentsBefore = FulfillmentGenerator.generateForDate([mockSub], {
      serviceDate: "2026-09-09",
    });
    expect(fulfillmentsBefore).toHaveLength(1);

    // During vacation (Sept 12) -> Paused, suppresses fulfillment (0 fulfillments)
    expect(VacationService.isSubscriptionPausedOnDate("usr_priya", "sub_diwali", "2026-09-12")).toBe(true);
    const fulfillmentsDuring = FulfillmentGenerator.generateForDate([mockSub], {
      serviceDate: "2026-09-12",
    });
    expect(fulfillmentsDuring).toHaveLength(0);

    // After vacation (Sept 16) -> Automatically resumes!
    expect(VacationService.isSubscriptionPausedOnDate("usr_priya", "sub_diwali", "2026-09-16")).toBe(false);
    const fulfillmentsAfter = FulfillmentGenerator.generateForDate([mockSub], {
      serviceDate: "2026-09-16",
    });
    expect(fulfillmentsAfter).toHaveLength(1);
  });

  it("permits early resumption of services before scheduled end date", async () => {
    const vac = await VacationService.createVacation({
      customerId: "usr_priya",
      startDate: "2026-09-10",
      endDate: "2026-09-20",
      reason: "Holiday",
    });

    expect(VacationService.isSubscriptionPausedOnDate("usr_priya", "sub_diwali", "2026-09-12")).toBe(true);

    // Returned early on Sept 12
    await VacationService.resumeEarly(vac.id);
    expect(VacationService.isSubscriptionPausedOnDate("usr_priya", "sub_diwali", "2026-09-12")).toBe(false);
  });
});
