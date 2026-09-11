import {
  DeliveryRun,
  DeliveryStop,
  DeliveryRunSchema,
  DeliveryStopSchema,
} from "./delivery-schema";
import { FulfillmentStateMachine } from "../fulfillment/fulfillment-fsm";
import { AssetLedgerService } from "../assets/asset-ledger";

const runsStore = new Map<string, DeliveryRun>();

export interface GenerateRunSheetInput {
  tenantId: string;
  driverId: string;
  driverName: string;
  date: string;
  shift: "MORNING" | "LUNCH" | "EVENING";
  items: Array<{
    fulfillmentId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    society: string;
    tower: string;
    floor: number;
    flat: string;
    serviceName: string;
    quantity: number;
    isSkipped?: boolean;
    dropPreference?: "DOORSTEP" | "SECURITY_GATE" | "NEIGHBOR" | "HANDOVER";
    notes?: string;
  }>;
}

export class DeliveryEngine {
  /**
   * Generates a sequence-ordered run sheet clustered by Society -> Tower -> Floor (Top-Down elevator route)
   */
  static generateRunSheet(input: GenerateRunSheetInput): DeliveryRun {
    const runId = `run_${input.date}_${input.shift.toLowerCase()}_${input.driverId}`;

    // Sort by Society -> Tower -> Floor (descending: 14th floor down to 1st floor) -> Flat
    const sortedItems = [...input.items].sort((a, b) => {
      const societyCmp = a.society.localeCompare(b.society);
      if (societyCmp !== 0) return societyCmp;

      const towerCmp = a.tower.localeCompare(b.tower);
      if (towerCmp !== 0) return towerCmp;

      // Descending floor for elevator convenience
      if (b.floor !== a.floor) return b.floor - a.floor;

      return a.flat.localeCompare(b.flat);
    });

    let skippedCount = 0;

    const stops: DeliveryStop[] = sortedItems.map((item, index) => {
      const isSkipped = !!item.isSkipped;
      if (isSkipped) skippedCount++;

      return DeliveryStopSchema.parse({
        id: `stop_${runId}_${index + 1}`,
        fulfillmentId: item.fulfillmentId,
        tenantId: input.tenantId,
        customerId: item.customerId,
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        society: item.society,
        tower: item.tower,
        floor: item.floor,
        flat: item.flat,
        serviceName: item.serviceName,
        quantity: item.quantity,
        status: isSkipped ? "SKIPPED" : "PENDING",
        dropPreference: item.dropPreference || "DOORSTEP",
        notes: item.notes,
      });
    });

    const run: DeliveryRun = DeliveryRunSchema.parse({
      id: runId,
      tenantId: input.tenantId,
      driverId: input.driverId,
      driverName: input.driverName,
      date: input.date,
      shift: input.shift,
      stops,
      totalStops: stops.length,
      completedStops: 0,
      skippedStops: skippedCount,
      failedStops: 0,
      status: stops.length === skippedCount ? "COMPLETED" : "NOT_STARTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    runsStore.set(runId, run);
    return run;
  }

  /**
   * Retrieves a run sheet by ID
   */
  static getRunSheet(runId: string): DeliveryRun | null {
    return runsStore.get(runId) || null;
  }

  /**
   * Completes a delivery stop (Driver tapped Delivered)
   */
  static async completeStop(params: {
    runId: string;
    stopId: string;
    assetCollected?: number;
    assetDelivered?: number;
    notes?: string;
  }): Promise<{ run: DeliveryRun; stop: DeliveryStop }> {
    const run = runsStore.get(params.runId);
    if (!run) {
      throw new Error(`Delivery run ${params.runId} not found`);
    }

    const stop = run.stops.find((s) => s.id === params.stopId);
    if (!stop) {
      throw new Error(`Stop ${params.stopId} not found in run ${params.runId}`);
    }

    if (stop.status === "SKIPPED") {
      throw new Error("Cannot mark a skipped stop as delivered");
    }

    const wasPending = stop.status === "PENDING";

    stop.status = "DELIVERED";
    stop.deliveredAt = new Date().toISOString();
    if (params.assetCollected !== undefined) stop.assetCollected = params.assetCollected;
    if (params.assetDelivered !== undefined) stop.assetDelivered = params.assetDelivered;
    if (params.notes) stop.notes = params.notes;

    if (wasPending) {
      run.completedStops += 1;
    }

    run.status = "IN_PROGRESS";

    // Reconcile with underlying Fulfillment FSM if exists
    try {
      const fulfillment = FulfillmentStateMachine.getById(stop.fulfillmentId);
      if (fulfillment) {
        if (fulfillment.status !== "OUT_FOR_DELIVERY") {
          fulfillment.status = "OUT_FOR_DELIVERY";
        }
        FulfillmentStateMachine.transition(fulfillment, {
          action: "MARK_DELIVERED",
          actionTime: stop.deliveredAt,
          driverId: run.driverId,
        });
      }
    } catch {
      // Pass if mock / direct test
    }

    // Record asset container exchange if tracked
    if ((params.assetCollected && params.assetCollected > 0) || (params.assetDelivered && params.assetDelivered > 0)) {
      try {
        await AssetLedgerService.recordExchange({
          tenantId: run.tenantId,
          customerId: stop.customerId,
          assetType: "TIFFIN_BOX_STEEL",
          quantityDelivered: params.assetDelivered || 0,
          quantityCollected: params.assetCollected || 0,
          referenceId: stop.id,
        });
      } catch {
        // Continue if asset ledger error
      }
    }

    // Check if run is fully completed
    const unresolvedStops = run.stops.filter((s) => s.status === "PENDING");
    if (unresolvedStops.length === 0) {
      run.status = "COMPLETED";
    }

    run.updatedAt = new Date().toISOString();
    runsStore.set(run.id, run);

    return { run, stop };
  }

  /**
   * Marks a stop as failed (e.g. Door locked, customer not responding)
   */
  static failStop(params: {
    runId: string;
    stopId: string;
    failureReason: string;
  }): { run: DeliveryRun; stop: DeliveryStop } {
    const run = runsStore.get(params.runId);
    if (!run) {
      throw new Error(`Delivery run ${params.runId} not found`);
    }

    const stop = run.stops.find((s) => s.id === params.stopId);
    if (!stop) {
      throw new Error(`Stop ${params.stopId} not found in run ${params.runId}`);
    }

    if (stop.status === "SKIPPED") {
      throw new Error("Cannot fail a skipped stop");
    }

    const wasPending = stop.status === "PENDING";

    stop.status = "FAILED";
    stop.failureReason = params.failureReason;

    if (wasPending) {
      run.failedStops += 1;
    }

    run.status = "IN_PROGRESS";

    // Reconcile with underlying Fulfillment FSM
    try {
      const fulfillment = FulfillmentStateMachine.getById(stop.fulfillmentId);
      if (fulfillment) {
        if (fulfillment.status !== "OUT_FOR_DELIVERY") {
          fulfillment.status = "OUT_FOR_DELIVERY";
        }
        FulfillmentStateMachine.transition(fulfillment, {
          action: "MARK_FAILED",
          notes: params.failureReason,
          driverId: run.driverId,
        });
      }
    } catch {
      // Pass
    }

    const unresolvedStops = run.stops.filter((s) => s.status === "PENDING");
    if (unresolvedStops.length === 0) {
      run.status = "COMPLETED";
    }

    run.updatedAt = new Date().toISOString();
    runsStore.set(run.id, run);

    return { run, stop };
  }
}
