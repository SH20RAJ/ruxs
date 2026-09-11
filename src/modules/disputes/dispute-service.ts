import {
  Dispute,
  FileDisputeInput,
  FileDisputeInputSchema,
  DisputeResolution,
  DisputeResolutionSchema,
  DisputeSchema,
} from "./dispute-schema";
import { FulfillmentStateMachine } from "../fulfillment/fulfillment-fsm";
import { KhataLedgerService } from "../khata/khata-ledger";
import { KhataEntry } from "../khata/khata-schema";
import { Paise } from "../../shared/types/money";

const disputesStore = new Map<string, Dispute>();

export class DisputeService {
  /**
   * Files a new dispute for a contested fulfillment
   */
  static fileDispute(rawInput: unknown): Dispute {
    const input: FileDisputeInput = FileDisputeInputSchema.parse(rawInput);
    const disputeId = `dsp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Transition underlying fulfillment state if exists
    try {
      const fulfillment = FulfillmentStateMachine.getById(input.fulfillmentId);
      if (fulfillment) {
        FulfillmentStateMachine.transition(fulfillment, {
          action: "DISPUTE",
          notes: input.customerComment,
        });
      }
    } catch {
      // Pass if mock / direct test
    }

    const dispute: Dispute = DisputeSchema.parse({
      id: disputeId,
      tenantId: input.tenantId,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      fulfillmentId: input.fulfillmentId,
      reason: input.reason,
      disputedAmountPaise: input.disputedAmountPaise,
      evidence: {
        driverDeliveredAt: input.driverDeliveredAt,
        driverDropNotes: input.driverDropNotes,
        customerComment: input.customerComment,
        customerPhotoUrl: input.customerPhotoUrl,
      },
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    disputesStore.set(disputeId, dispute);
    return dispute;
  }

  /**
   * Arbitrates and resolves a dispute (with compensating append-only Khata ledger refund)
   */
  static async resolveDispute(
    disputeId: string,
    rawResolution: unknown
  ): Promise<{ dispute: Dispute; compensatingEntry?: KhataEntry }> {
    const dispute = disputesStore.get(disputeId);
    if (!dispute) {
      throw new Error(`Dispute ${disputeId} not found`);
    }

    if (dispute.status === "REFUNDED" || dispute.status === "REJECTED") {
      throw new Error(`Dispute ${disputeId} is already resolved with status ${dispute.status}`);
    }

    const resolution: DisputeResolution = DisputeResolutionSchema.parse(rawResolution);

    let compensatingEntry: KhataEntry | undefined;

    if (resolution.decision === "FULL_REFUND" || resolution.decision === "PARTIAL_REFUND") {
      if (resolution.refundPaise <= 0) {
        throw new Error("Refund amount must be greater than zero for refund decisions");
      }
      if (resolution.refundPaise > dispute.disputedAmountPaise) {
        throw new Error("Refund amount cannot exceed the disputed amount");
      }

      // Execute strictly append-only compensating CREDIT entry into digital Khata
      compensatingEntry = await KhataLedgerService.recordEntry({
        tenantId: dispute.tenantId,
        customerId: dispute.customerId,
        entryType: "REFUND_CREDIT",
        direction: "CREDIT",
        amountPaise: resolution.refundPaise as Paise,
        referenceType: "DISPUTE",
        referenceId: dispute.id,
        description: `Dispute Refund: ${dispute.reason} - ${resolution.resolutionNotes}`,
      });

      dispute.status = "REFUNDED";
    } else {
      dispute.status = "REJECTED";
    }

    dispute.resolution = resolution;
    dispute.updatedAt = new Date().toISOString();
    disputesStore.set(dispute.id, dispute);

    return { dispute, compensatingEntry };
  }

  /**
   * Retrieves dispute by ID
   */
  static getDispute(id: string): Dispute | null {
    return disputesStore.get(id) || null;
  }

  /**
   * Lists disputes for a vendor tenant
   */
  static listByTenant(tenantId: string, status?: string): Dispute[] {
    const all = Array.from(disputesStore.values()).filter((d) => d.tenantId === tenantId);
    if (status) {
      return all.filter((d) => d.status === status);
    }
    return all;
  }

  /**
   * Lists disputes filed by a customer
   */
  static listByCustomer(customerId: string): Dispute[] {
    return Array.from(disputesStore.values()).filter((d) => d.customerId === customerId);
  }
}
