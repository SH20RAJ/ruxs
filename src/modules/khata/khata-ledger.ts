import {
  KhataEntry,
  CreateKhataEntryInput,
  CreateKhataEntrySchema,
} from "./khata-schema";
import { Paise, addPaise, subtractPaise } from "../../shared/types/money";

// Append-only ledger store partitioned by [tenantId:customerId]
const ledgerStore = new Map<string, KhataEntry[]>();

export class KhataLedgerService {
  private static getPartitionKey(tenantId: string, customerId: string): string {
    return `${tenantId}:${customerId}`;
  }

  /**
   * Appends an immutable financial transaction into the digital Khata
   */
  static async recordEntry(rawInput: unknown): Promise<KhataEntry> {
    const validated = CreateKhataEntrySchema.parse(rawInput);
    const key = this.getPartitionKey(validated.tenantId, validated.customerId);
    const entries = ledgerStore.get(key) || [];

    // Current balance is either the last entry's running balance or 0
    const currentBalance = entries.length > 0 ? entries[entries.length - 1].runningBalancePaise : (0 as Paise);

    const amount = validated.amountPaise as Paise;
    let newBalance: Paise;

    if (validated.direction === "DEBIT") {
      // DEBIT increases customer owing
      newBalance = addPaise(currentBalance, amount);
    } else {
      // CREDIT decreases customer owing (payments, discounts, refunds)
      newBalance = subtractPaise(currentBalance, amount);
    }

    const entryId = `kht_${Math.random().toString(36).substring(2, 11)}`;
    const newEntry: KhataEntry = {
      id: entryId,
      tenantId: validated.tenantId,
      customerId: validated.customerId,
      householdId: validated.householdId,
      entryType: validated.entryType,
      direction: validated.direction,
      amountPaise: amount,
      runningBalancePaise: newBalance,
      referenceType: validated.referenceType,
      referenceId: validated.referenceId,
      description: validated.description,
      createdAt: new Date().toISOString(),
    };

    entries.push(newEntry);
    ledgerStore.set(key, entries);

    return newEntry;
  }

  /**
   * Retrieves full transactional statement for a customer
   */
  static async getCustomerStatement(tenantId: string, customerId: string): Promise<{
    entries: KhataEntry[];
    currentBalancePaise: Paise;
    totalDebitsPaise: Paise;
    totalCreditsPaise: Paise;
  }> {
    const key = this.getPartitionKey(tenantId, customerId);
    const entries = ledgerStore.get(key) || [];

    let totalDebits = 0 as Paise;
    let totalCredits = 0 as Paise;

    for (const e of entries) {
      if (e.direction === "DEBIT") {
        totalDebits = addPaise(totalDebits, e.amountPaise);
      } else {
        totalCredits = addPaise(totalCredits, e.amountPaise);
      }
    }

    const derivedBalance = subtractPaise(totalDebits, totalCredits);

    return {
      entries,
      currentBalancePaise: derivedBalance,
      totalDebitsPaise: totalDebits,
      totalCreditsPaise: totalCredits,
    };
  }

  /**
   * Verifies mathematical integrity: ensures every running balance matches sum of previous debits minus credits
   */
  static verifyIntegrity(tenantId: string, customerId: string): boolean {
    const key = this.getPartitionKey(tenantId, customerId);
    const entries = ledgerStore.get(key) || [];

    let cumulative = 0 as Paise;
    for (const e of entries) {
      if (e.direction === "DEBIT") {
        cumulative = addPaise(cumulative, e.amountPaise);
      } else {
        cumulative = subtractPaise(cumulative, e.amountPaise);
      }

      if (cumulative !== e.runningBalancePaise) {
        return false;
      }
    }

    return true;
  }

  static clearStore(): void {
    ledgerStore.clear();
  }
}
