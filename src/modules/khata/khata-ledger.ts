import {
  KhataEntry,
  CreateKhataEntrySchema,
} from "./khata-schema";
import { Paise, addPaise, subtractPaise } from "../../shared/types/money";
import { db, isTestEnv } from "../../shared/db";
import { khataEntries as khataEntriesTable } from "../../shared/db/schema";
import { eq, and, asc } from "drizzle-orm";

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
      newBalance = addPaise(currentBalance, amount);
    } else {
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

    if (!isTestEnv) {
      try {
        await db.insert(khataEntriesTable).values({
          id: entryId,
          tenantId: validated.tenantId,
          customerId: validated.customerId,
          householdId: validated.householdId,
          entryType: validated.entryType,
          direction: validated.direction,
          amountPaise: Number(amount),
          runningBalancePaise: Number(newBalance),
          referenceType: validated.referenceType,
          referenceId: validated.referenceId,
          description: validated.description,
        });
      } catch {
        // In-memory fallback
      }
    }

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
    if (!isTestEnv) {
      try {
        const dbRows = await db
          .select()
          .from(khataEntriesTable)
          .where(
            and(
              eq(khataEntriesTable.tenantId, tenantId),
              eq(khataEntriesTable.customerId, customerId)
            )
          )
          .orderBy(asc(khataEntriesTable.createdAt));

        if (dbRows && dbRows.length > 0) {
          const entries: KhataEntry[] = dbRows.map((r) => ({
            id: r.id,
            tenantId: r.tenantId,
            customerId: r.customerId,
            householdId: r.householdId ?? undefined,
            entryType: r.entryType as any,
            direction: r.direction as any,
            amountPaise: r.amountPaise as Paise,
            runningBalancePaise: r.runningBalancePaise as Paise,
            referenceType: r.referenceType as any,
            referenceId: r.referenceId ?? undefined,
            description: r.description,
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
          }));

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
      } catch {
        // Fallback to in-memory store
      }
    }

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
   * Verifies mathematical integrity
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
