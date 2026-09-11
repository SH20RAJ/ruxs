import { Subscription } from "../subscriptions/subscription-schema";
import { SubscriptionEngine } from "../subscriptions/subscription-engine";
import { DailyFulfillment, FulfillmentItemSnapshot } from "./fulfillment-schema";
import { FulfillmentStateMachine } from "./fulfillment-fsm";
import { VacationService } from "../vacation/vacation-service";
import { Paise } from "../../shared/types/money";

export interface GenerateFulfillmentsOptions {
  serviceDate: string; // YYYY-MM-DD
  cutoffTimeStr?: string; // e.g., "10:00"
  shift?: "MORNING" | "LUNCH" | "EVENING" | "NIGHT";
}

export class FulfillmentGenerator {
  /**
   * Generates daily fulfillment records for all active subscriptions scheduled on serviceDate
   */
  static generateForDate(
    subscriptions: Subscription[],
    options: GenerateFulfillmentsOptions
  ): DailyFulfillment[] {
    const { serviceDate, cutoffTimeStr = "10:00", shift = "LUNCH" } = options;
    const cutoffDateTime = `${serviceDate}T${cutoffTimeStr}:00.000Z`;
    const now = new Date().toISOString();

    const createdList: DailyFulfillment[] = [];

    for (const sub of subscriptions) {
      // 1. Check if subscription is scheduled for this calendar date
      if (!SubscriptionEngine.isScheduledOnDate(sub, serviceDate)) {
        continue;
      }

      // 2. Vacation Mode Guard: Check if subscription is paused under an active vacation window
      if (VacationService.isSubscriptionPausedOnDate(sub.customerId, sub.id, serviceDate)) {
        continue;
      }

      const fulfillmentId = `ful_${Math.random().toString(36).substring(2, 11)}`;
      const totalAmountPaise = (sub.unitPricePaise * sub.defaultQuantity) as Paise;

      // Freeze product and price snapshot
      const itemSnapshot: FulfillmentItemSnapshot = {
        productId: sub.productId,
        productName: sub.productName,
        quantity: sub.defaultQuantity,
        unitPricePaise: sub.unitPricePaise,
        totalPricePaise: totalAmountPaise,
      };

      const initialStatus = sub.autopilotDefault === "CONFIRMED" ? "CONFIRMED" : "SCHEDULED";

      const record: DailyFulfillment = {
        id: fulfillmentId,
        tenantId: sub.tenantId,
        subscriptionId: sub.id,
        customerId: sub.customerId,
        householdId: sub.householdId,
        serviceDate,
        shift,
        status: initialStatus,
        items: [itemSnapshot],
        totalPricePaise: totalAmountPaise,
        cutoffTime: cutoffDateTime,
        createdAt: now,
        updatedAt: now,
      };

      FulfillmentStateMachine.save(record);
      createdList.push(record);
    }

    return createdList;
  }
}
