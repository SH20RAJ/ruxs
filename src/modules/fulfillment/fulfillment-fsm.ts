import {
  DailyFulfillment,
  FulfillmentState,
  TransitionAction,
} from "./fulfillment-schema";
import { Paise, calculatePercentage } from "../../shared/types/money";

const fulfillmentStore = new Map<string, DailyFulfillment>();

export class FulfillmentStateMachine {
  /**
   * Evaluates and applies a state transition to an existing daily fulfillment
   */
  static transition(
    fulfillment: DailyFulfillment,
    action: TransitionAction
  ): DailyFulfillment {
    const current = fulfillment.status;
    const now = action.actionTime ? new Date(action.actionTime) : new Date();
    const cutoff = new Date(fulfillment.cutoffTime);

    switch (action.action) {
      case "REQUEST_CONFIRMATION":
        if (current !== "SCHEDULED") {
          throw new Error(`Cannot request confirmation from state ${current}`);
        }
        fulfillment.status = "CONFIRMATION_REQUIRED";
        break;

      case "CONFIRM":
        if (current !== "SCHEDULED" && current !== "CONFIRMATION_REQUIRED") {
          // Idempotency: if already confirmed, return without error
          if (current === "CONFIRMED") return fulfillment;
          throw new Error(`Cannot confirm fulfillment from state ${current}`);
        }
        fulfillment.status = "CONFIRMED";
        break;

      case "SKIP": {
        // Can skip from SCHEDULED, CONFIRMATION_REQUIRED, or CONFIRMED
        if (current !== "SCHEDULED" && current !== "CONFIRMATION_REQUIRED" && current !== "CONFIRMED") {
          if (current === "SKIPPED" || current === "LATE_SKIP") return fulfillment;
          throw new Error(`Cannot skip fulfillment from state ${current}`);
        }

        // Cutoff Guard: check if current action time is past the cutoff deadline
        if (now.getTime() > cutoff.getTime()) {
          fulfillment.status = "LATE_SKIP";
          // Calculate 50% late cancellation fee
          fulfillment.lateFeePaise = calculatePercentage(fulfillment.totalPricePaise, 50);
          fulfillment.notes = action.notes || "Late skip received past cutoff deadline";
        } else {
          fulfillment.status = "SKIPPED";
          fulfillment.lateFeePaise = 0 as Paise;
          fulfillment.notes = action.notes || "Standard skip confirmed prior to cutoff";
        }
        break;
      }

      case "START_PREP":
        if (current !== "CONFIRMED") {
          if (current === "IN_PREPARATION") return fulfillment;
          throw new Error(`Cannot start preparation for unconfirmed fulfillment (current: ${current})`);
        }
        fulfillment.status = "IN_PREPARATION";
        break;

      case "DISPATCH":
        if (current !== "IN_PREPARATION" && current !== "CONFIRMED") {
          if (current === "OUT_FOR_DELIVERY") return fulfillment;
          throw new Error(`Cannot dispatch fulfillment from state ${current}`);
        }
        fulfillment.status = "OUT_FOR_DELIVERY";
        break;

      case "MARK_DELIVERED":
        if (current !== "OUT_FOR_DELIVERY") {
          // Idempotency check: driver re-tapping delivered due to poor network
          if (current === "DELIVERED") return fulfillment;
          throw new Error(`Cannot mark delivered from state ${current}`);
        }
        fulfillment.status = "DELIVERED";
        fulfillment.deliveredAt = now.toISOString();
        break;

      case "MARK_FAILED":
        if (current !== "OUT_FOR_DELIVERY") {
          throw new Error(`Cannot mark failed from state ${current}`);
        }
        fulfillment.status = "FAILED";
        fulfillment.notes = action.notes || "Delivery attempt failed";
        break;

      case "DISPUTE":
        if (current !== "DELIVERED") {
          throw new Error(`Only delivered fulfillments can be disputed (current: ${current})`);
        }
        fulfillment.status = "DISPUTED";
        fulfillment.notes = action.notes || "Delivery disputed by customer";
        break;

      case "CANCEL":
        if (current === "DELIVERED") {
          throw new Error("Delivered orders cannot be cancelled directly; must go through dispute resolution");
        }
        fulfillment.status = "CANCELLED";
        fulfillment.notes = action.notes || "Cancelled by vendor";
        break;

      default:
        throw new Error(`Unknown transition action: ${(action as any).action}`);
    }

    fulfillment.updatedAt = now.toISOString();
    fulfillmentStore.set(fulfillment.id, fulfillment);
    return fulfillment;
  }

  static getById(id: string): DailyFulfillment | null {
    return fulfillmentStore.get(id) || null;
  }

  static save(fulfillment: DailyFulfillment): void {
    fulfillmentStore.set(fulfillment.id, fulfillment);
  }

  static listByTenantAndDate(tenantId: string, serviceDate: string): DailyFulfillment[] {
    return Array.from(fulfillmentStore.values()).filter(
      (f) => f.tenantId === tenantId && f.serviceDate === serviceDate
    );
  }

  static listByCustomer(customerId: string): DailyFulfillment[] {
    return Array.from(fulfillmentStore.values()).filter((f) => f.customerId === customerId);
  }

  static clearStore(): void {
    fulfillmentStore.clear();
  }
}
