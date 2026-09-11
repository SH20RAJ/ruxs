import {
  AssetHolding,
  AssetLedgerEntry,
  AssetType,
  RecordAssetExchangeInput,
  RecordAssetExchangeSchema,
} from "./asset-schema";
import { KhataLedgerService } from "../khata/khata-ledger";
import { Paise, addPaise, subtractPaise } from "../../shared/types/money";

const holdingsStore = new Map<string, AssetHolding>();
const ledgerStore = new Map<string, AssetLedgerEntry[]>();

export class AssetLedgerService {
  private static getKey(tenantId: string, customerId: string, assetType: AssetType): string {
    return `${tenantId}:${customerId}:${assetType}`;
  }

  /**
   * Records a doorstep container exchange (e.g. delivered 1 full water jar, collected 1 empty jar)
   */
  static async recordExchange(rawInput: unknown): Promise<{
    holding: AssetHolding;
    entry: AssetLedgerEntry;
  }> {
    const validated = RecordAssetExchangeSchema.parse(rawInput);
    const key = this.getKey(validated.tenantId, validated.customerId, validated.assetType);

    const holding = holdingsStore.get(key) || {
      tenantId: validated.tenantId,
      customerId: validated.customerId,
      assetType: validated.assetType,
      holdingCount: 0,
      depositPerUnitPaise: 15000 as Paise, // ₹150 standard container deposit
      totalDepositHeldPaise: 0 as Paise,
      updatedAt: new Date().toISOString(),
    };

    const netDelta = validated.quantityDelivered - validated.quantityCollected;
    const resultingHolding = holding.holdingCount + netDelta;

    if (resultingHolding < 0) {
      throw new Error(
        `Invalid exchange: cannot collect ${validated.quantityCollected} containers when customer holds only ${holding.holdingCount}`
      );
    }

    holding.holdingCount = resultingHolding;
    holding.totalDepositHeldPaise = (resultingHolding * holding.depositPerUnitPaise) as Paise;
    holding.updatedAt = new Date().toISOString();
    holdingsStore.set(key, holding);

    const entryId = `asl_${Math.random().toString(36).substring(2, 11)}`;
    const entry: AssetLedgerEntry = {
      id: entryId,
      tenantId: validated.tenantId,
      customerId: validated.customerId,
      assetType: validated.assetType,
      quantityDelivered: validated.quantityDelivered,
      quantityCollected: validated.quantityCollected,
      netDelta,
      resultingHoldingCount: resultingHolding,
      fulfillmentId: validated.fulfillmentId,
      notes: validated.notes,
      createdAt: new Date().toISOString(),
    };

    const entries = ledgerStore.get(key) || [];
    entries.push(entry);
    ledgerStore.set(key, entries);

    return { holding, entry };
  }

  /**
   * Reconciles asset returns upon subscription termination and refunds deposit to Khata if all containers are returned
   */
  static async reconcileAndRefundDeposit(
    tenantId: string,
    customerId: string,
    assetType: AssetType
  ): Promise<{ refunded: boolean; message: string; refundPaise: Paise }> {
    const key = this.getKey(tenantId, customerId, assetType);
    const holding = holdingsStore.get(key);

    if (!holding || holding.holdingCount === 0) {
      return {
        refunded: false,
        message: "No containers or active deposits found for this customer",
        refundPaise: 0 as Paise,
      };
    }

    // Acceptance Criteria: verify 0 unreturned containers before deposit refund
    if (holding.holdingCount > 0) {
      throw new Error(
        `Cannot refund deposit: customer still holds ${holding.holdingCount} unreturned ${assetType} containers`
      );
    }

    const refundAmount = holding.totalDepositHeldPaise;

    // Credit Khata with deposit refund
    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "REFUND_CREDIT",
      direction: "CREDIT",
      amountPaise: refundAmount,
      description: `Security Deposit Refund for returned ${assetType}`,
    });

    holding.totalDepositHeldPaise = 0 as Paise;
    holding.updatedAt = new Date().toISOString();
    holdingsStore.set(key, holding);

    return {
      refunded: true,
      message: `Successfully refunded ₹${refundAmount / 100} deposit to Khata`,
      refundPaise: refundAmount,
    };
  }

  static getHolding(tenantId: string, customerId: string, assetType: AssetType): AssetHolding | null {
    return holdingsStore.get(this.getKey(tenantId, customerId, assetType)) || null;
  }

  static clearStore(): void {
    holdingsStore.clear();
    ledgerStore.clear();
  }
}
