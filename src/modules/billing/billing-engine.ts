import {
  Invoice,
  InvoiceItem,
  GenerateInvoiceInput,
  GenerateInvoiceSchema,
} from "./billing-schema";
import { KhataLedgerService } from "../khata/khata-ledger";
import { Paise, addPaise, subtractPaise } from "../../shared/types/money";
import { db, isTestEnv } from "../../shared/db";
import { invoices as invoicesTable } from "../../shared/db/schema";
import { eq } from "drizzle-orm";

const invoiceStore = new Map<string, Invoice>();
let invoiceSequence = 1;

export class BillingEngine {
  /**
   * Generates a monthly statement invoice derived from the customer's Khata entries
   */
  static async generateInvoice(rawInput: unknown): Promise<Invoice> {
    const validated = GenerateInvoiceSchema.parse(rawInput);
    const invoiceId = `inv_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    const yearMonth = validated.periodStart.substring(0, 7).replace("-", "-");
    const invoiceNumber = `INV-${yearMonth}-${invoiceSequence.toString().padStart(4, "0")}`;
    invoiceSequence++;

    // Retrieve Khata statement
    const statement = await KhataLedgerService.getCustomerStatement(
      validated.tenantId,
      validated.customerId
    );

    // Group items from Khata debits within period
    const items: InvoiceItem[] = [];
    let subtotal = 0 as Paise;

    for (const entry of statement.entries) {
      if (entry.direction === "DEBIT") {
        const item: InvoiceItem = {
          id: `item_${Math.random().toString(36).substring(2, 8)}`,
          description: entry.description,
          quantity: 1,
          unitPricePaise: entry.amountPaise,
          totalPaise: entry.amountPaise,
        };
        items.push(item);
        subtotal = addPaise(subtotal, entry.amountPaise);
      }
    }

    const discount = validated.discountPaise as Paise;
    const tax = 0 as Paise; // No GST for basic food/household under threshold
    const subtotalAfterDiscount = subtractPaise(subtotal, discount);

    // Any credits (payments) already made towards this statement
    const creditsAlreadyPaid = statement.totalCreditsPaise;
    const totalAmountDue = Math.max(
      0,
      subtractPaise(subtotalAfterDiscount, creditsAlreadyPaid)
    ) as Paise;

    const dueDate =
      validated.dueDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const invoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      tenantId: validated.tenantId,
      customerId: validated.customerId,
      periodStart: validated.periodStart,
      periodEnd: validated.periodEnd,
      dueDate,
      items,
      subtotalPaise: subtotal,
      previousBalancePaise: 0 as Paise,
      discountPaise: discount,
      taxPaise: tax,
      totalAmountDuePaise: totalAmountDue,
      amountPaidPaise: creditsAlreadyPaid,
      status: totalAmountDue === 0 ? "PAID" : "ISSUED",
      createdAt: now,
    };

    invoiceStore.set(invoiceId, invoice);

    if (!isTestEnv) {
      try {
        await db.insert(invoicesTable).values({
          id: invoiceId,
          tenantId: validated.tenantId,
          customerId: validated.customerId,
          householdId: null,
          invoiceNumber,
          periodStart: validated.periodStart,
          periodEnd: validated.periodEnd,
          dueDate,
          subtotalPaise: subtotal,
          discountPaise: discount,
          taxPaise: tax,
          totalAmountDuePaise: totalAmountDue,
          amountPaidPaise: creditsAlreadyPaid,
          status: totalAmountDue === 0 ? "PAID" : "ISSUED",
        });
      } catch (err) {
        console.error("Failed to insert invoice into Neon DB:", err);
      }
    }

    return invoice;
  }

  /**
   * Applies a payment amount to an existing invoice and transitions status
   */
  static async recordInvoicePayment(
    invoiceId: string,
    paidAmountPaise: Paise
  ): Promise<Invoice> {
    let inv = invoiceStore.get(invoiceId);
    if (!inv && !isTestEnv) {
      inv = (await this.getById(invoiceId)) || undefined;
    }
    if (!inv) throw new Error("Invoice not found");

    const newAmountPaid = addPaise(inv.amountPaidPaise, paidAmountPaise);
    inv.amountPaidPaise = newAmountPaid;

    if (newAmountPaid >= inv.totalAmountDuePaise) {
      inv.status = "PAID";
      inv.paidAt = new Date().toISOString();
    } else if (newAmountPaid > 0) {
      inv.status = "PARTIALLY_PAID";
    }

    invoiceStore.set(invoiceId, inv);

    if (!isTestEnv) {
      try {
        await db
          .update(invoicesTable)
          .set({
            amountPaidPaise: newAmountPaid,
            status: inv.status,
          })
          .where(eq(invoicesTable.id, invoiceId));
      } catch (err) {
        console.error("Failed to update invoice payment in Neon DB:", err);
      }
    }

    return inv;
  }

  static async getById(invoiceId: string): Promise<Invoice | null> {
    const memory = invoiceStore.get(invoiceId);
    if (memory) return memory;

    if (!isTestEnv) {
      try {
        const rows = await db
          .select()
          .from(invoicesTable)
          .where(eq(invoicesTable.id, invoiceId));

        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            invoiceNumber: r.invoiceNumber,
            tenantId: r.tenantId,
            customerId: r.customerId,
            householdId: r.householdId || undefined,
            periodStart: r.periodStart,
            periodEnd: r.periodEnd,
            dueDate: r.dueDate,
            items: [
              {
                id: `item_${r.id}`,
                description: `Monthly billing statement (${r.periodStart} to ${r.periodEnd})`,
                quantity: 1,
                unitPricePaise: r.subtotalPaise as Paise,
                totalPaise: r.subtotalPaise as Paise,
              },
            ],
            subtotalPaise: r.subtotalPaise as Paise,
            previousBalancePaise: 0 as Paise,
            discountPaise: r.discountPaise as Paise,
            taxPaise: r.taxPaise as Paise,
            totalAmountDuePaise: r.totalAmountDuePaise as Paise,
            amountPaidPaise: r.amountPaidPaise as Paise,
            status: r.status as any,
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.error("Failed to fetch invoice by ID from Neon DB:", err);
      }
    }

    return null;
  }

  static async listByCustomer(customerId: string): Promise<Invoice[]> {
    if (!isTestEnv) {
      try {
        const rows = await db
          .select()
          .from(invoicesTable)
          .where(eq(invoicesTable.customerId, customerId));

        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            invoiceNumber: r.invoiceNumber,
            tenantId: r.tenantId,
            customerId: r.customerId,
            householdId: r.householdId || undefined,
            periodStart: r.periodStart,
            periodEnd: r.periodEnd,
            dueDate: r.dueDate,
            items: [
              {
                id: `item_${r.id}`,
                description: `Monthly billing statement (${r.periodStart} to ${r.periodEnd})`,
                quantity: 1,
                unitPricePaise: r.subtotalPaise as Paise,
                totalPaise: r.subtotalPaise as Paise,
              },
            ],
            subtotalPaise: r.subtotalPaise as Paise,
            previousBalancePaise: 0 as Paise,
            discountPaise: r.discountPaise as Paise,
            taxPaise: r.taxPaise as Paise,
            totalAmountDuePaise: r.totalAmountDuePaise as Paise,
            amountPaidPaise: r.amountPaidPaise as Paise,
            status: r.status as any,
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.error("Failed to list invoices by customer from Neon DB:", err);
      }
    }

    return Array.from(invoiceStore.values()).filter((i) => i.customerId === customerId);
  }

  static async listByTenant(tenantId: string): Promise<Invoice[]> {
    if (!isTestEnv) {
      try {
        const rows = await db
          .select()
          .from(invoicesTable)
          .where(eq(invoicesTable.tenantId, tenantId));

        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            invoiceNumber: r.invoiceNumber,
            tenantId: r.tenantId,
            customerId: r.customerId,
            householdId: r.householdId || undefined,
            periodStart: r.periodStart,
            periodEnd: r.periodEnd,
            dueDate: r.dueDate,
            items: [
              {
                id: `item_${r.id}`,
                description: `Monthly billing statement (${r.periodStart} to ${r.periodEnd})`,
                quantity: 1,
                unitPricePaise: r.subtotalPaise as Paise,
                totalPaise: r.subtotalPaise as Paise,
              },
            ],
            subtotalPaise: r.subtotalPaise as Paise,
            previousBalancePaise: 0 as Paise,
            discountPaise: r.discountPaise as Paise,
            taxPaise: r.taxPaise as Paise,
            totalAmountDuePaise: r.totalAmountDuePaise as Paise,
            amountPaidPaise: r.amountPaidPaise as Paise,
            status: r.status as any,
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.error("Failed to list invoices by tenant from Neon DB:", err);
      }
    }

    return Array.from(invoiceStore.values()).filter((i) => i.tenantId === tenantId);
  }

  static clearStore(): void {
    invoiceStore.clear();
    invoiceSequence = 1;
  }
}
