import { DailyFulfillment } from "../fulfillment/fulfillment-schema";
import { FulfillmentStateMachine } from "../fulfillment/fulfillment-fsm";
import { calculatePercentage, Paise } from "../../shared/types/money";

export interface KitchenPrepBatch {
  tenantId: string;
  serviceDate: string;
  shift: string;
  totalScheduled: number;
  totalConfirmed: number;
  totalInPrep: number;
  totalOutForDelivery: number;
  totalDelivered: number;
  totalSkipped: number;
  totalLateSkips: number;
  skuBreakdown: Record<string, { productName: string; quantity: number; totalPaise: Paise }>;
  isCutoffLocked: boolean;
  cutoffTimeStr: string;
}

export class CutoffEngine {
  /**
   * Sweeps fulfillments for a tenant on a date and auto-locks expired cutoffs
   */
  static lockExpiredCutoffs(
    tenantId: string,
    serviceDate: string,
    evaluationTime?: string
  ): { lockedCount: number; updatedFulfillments: DailyFulfillment[] } {
    const list = FulfillmentStateMachine.listByTenantAndDate(tenantId, serviceDate);
    const now = evaluationTime ? new Date(evaluationTime) : new Date();

    let lockedCount = 0;
    const updatedFulfillments: DailyFulfillment[] = [];

    for (const f of list) {
      const cutoff = new Date(f.cutoffTime);

      // If past cutoff deadline
      if (now.getTime() >= cutoff.getTime()) {
        if (f.status === "CONFIRMATION_REQUIRED") {
          // Autopilot: auto-confirm if no response received before cutoff
          f.status = "CONFIRMED";
          f.notes = "Auto-confirmed upon cutoff deadline expiration";
          f.updatedAt = now.toISOString();
          FulfillmentStateMachine.save(f);
          lockedCount++;
          updatedFulfillments.push(f);
        } else if (f.status === "CONFIRMED") {
          // Progress confirmed orders into kitchen preparation
          f.status = "IN_PREPARATION";
          f.notes = "Cutoff locked: kitchen cooking batch initialized";
          f.updatedAt = now.toISOString();
          FulfillmentStateMachine.save(f);
          lockedCount++;
          updatedFulfillments.push(f);
        }
      }
    }

    return { lockedCount, updatedFulfillments };
  }

  /**
   * Aggregates kitchen prep demand by shift and SKU
   */
  static getKitchenBatchCounter(
    tenantId: string,
    serviceDate: string,
    shift: string = "LUNCH"
  ): KitchenPrepBatch {
    const list = FulfillmentStateMachine.listByTenantAndDate(tenantId, serviceDate).filter(
      (f) => f.shift === shift
    );

    let totalScheduled = 0;
    let totalConfirmed = 0;
    let totalInPrep = 0;
    let totalOutForDelivery = 0;
    let totalDelivered = 0;
    let totalSkipped = 0;
    let totalLateSkips = 0;
    let isCutoffLocked = false;
    let cutoffTimeStr = "";

    const skuBreakdown: Record<string, { productName: string; quantity: number; totalPaise: Paise }> = {};

    for (const f of list) {
      if (f.cutoffTime && !cutoffTimeStr) {
        cutoffTimeStr = f.cutoffTime;
      }

      switch (f.status) {
        case "SCHEDULED":
        case "CONFIRMATION_REQUIRED":
          totalScheduled++;
          break;
        case "CONFIRMED":
          totalConfirmed++;
          break;
        case "IN_PREPARATION":
          totalInPrep++;
          isCutoffLocked = true;
          break;
        case "OUT_FOR_DELIVERY":
          totalOutForDelivery++;
          isCutoffLocked = true;
          break;
        case "DELIVERED":
          totalDelivered++;
          isCutoffLocked = true;
          break;
        case "SKIPPED":
          totalSkipped++;
          break;
        case "LATE_SKIP":
          totalLateSkips++;
          break;
      }

      // Tally SKUs for production (orders requiring cooking/preparation: CONFIRMED, IN_PREPARATION, OUT_FOR_DELIVERY, DELIVERED)
      if (
        f.status === "CONFIRMED" ||
        f.status === "IN_PREPARATION" ||
        f.status === "OUT_FOR_DELIVERY" ||
        f.status === "DELIVERED"
      ) {
        for (const item of f.items) {
          if (!skuBreakdown[item.productId]) {
            skuBreakdown[item.productId] = {
              productName: item.productName,
              quantity: 0,
              totalPaise: 0 as Paise,
            };
          }
          skuBreakdown[item.productId].quantity += item.quantity;
          skuBreakdown[item.productId].totalPaise = (skuBreakdown[item.productId].totalPaise +
            item.totalPricePaise) as Paise;
        }
      }
    }

    return {
      tenantId,
      serviceDate,
      shift,
      totalScheduled,
      totalConfirmed,
      totalInPrep,
      totalOutForDelivery,
      totalDelivered,
      totalSkipped,
      totalLateSkips,
      skuBreakdown,
      isCutoffLocked,
      cutoffTimeStr,
    };
  }

  static async getKitchenBatchCounterAsync(
    tenantId: string,
    serviceDate: string,
    shift: string = "LUNCH"
  ): Promise<KitchenPrepBatch> {
    const list = (await FulfillmentStateMachine.listByTenantAndDateAsync(tenantId, serviceDate)).filter(
      (f) => f.shift === shift
    );

    let totalScheduled = 0;
    let totalConfirmed = 0;
    let totalInPrep = 0;
    let totalOutForDelivery = 0;
    let totalDelivered = 0;
    let totalSkipped = 0;
    let totalLateSkips = 0;
    let isCutoffLocked = false;
    let cutoffTimeStr = "";

    const skuBreakdown: Record<string, { productName: string; quantity: number; totalPaise: Paise }> = {};

    for (const f of list) {
      if (f.cutoffTime && !cutoffTimeStr) {
        cutoffTimeStr = f.cutoffTime;
      }

      switch (f.status) {
        case "SCHEDULED":
        case "CONFIRMATION_REQUIRED":
          totalScheduled++;
          break;
        case "CONFIRMED":
          totalConfirmed++;
          break;
        case "IN_PREPARATION":
          totalInPrep++;
          isCutoffLocked = true;
          break;
        case "OUT_FOR_DELIVERY":
          totalOutForDelivery++;
          isCutoffLocked = true;
          break;
        case "DELIVERED":
          totalDelivered++;
          isCutoffLocked = true;
          break;
        case "SKIPPED":
          totalSkipped++;
          break;
        case "LATE_SKIP":
          totalLateSkips++;
          break;
      }

      if (
        f.status === "CONFIRMED" ||
        f.status === "IN_PREPARATION" ||
        f.status === "OUT_FOR_DELIVERY" ||
        f.status === "DELIVERED"
      ) {
        for (const item of f.items) {
          if (!skuBreakdown[item.productId]) {
            skuBreakdown[item.productId] = {
              productName: item.productName,
              quantity: 0,
              totalPaise: 0 as Paise,
            };
          }
          skuBreakdown[item.productId].quantity += item.quantity;
          skuBreakdown[item.productId].totalPaise = (skuBreakdown[item.productId].totalPaise +
            item.totalPricePaise) as Paise;
        }
      }
    }

    return {
      tenantId,
      serviceDate,
      shift,
      totalScheduled,
      totalConfirmed,
      totalInPrep,
      totalOutForDelivery,
      totalDelivered,
      totalSkipped,
      totalLateSkips,
      skuBreakdown,
      isCutoffLocked,
      cutoffTimeStr,
    };
  }
}
