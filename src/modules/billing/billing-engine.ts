import {
  Invoice,
  InvoiceItem,
  GenerateInvoiceInput,
  GenerateInvoiceSchema,
} from "./billing-schema";
import { KhataLedgerService } from "../khata/khata-ledger";
import { Paise, addPaise, subtractPaise } from "../../shared/types/money";

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
    return invoice;
  }

  /**
   * Applies a payment amount to an existing invoice and transitions status
   */
  static async recordInvoicePayment(
    invoiceId: string,
    paidAmountPaise: Paise
  ): Promise<Invoice> {
    const inv = invoiceStore.get(invoiceId);
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
    return inv;
  }

  static async getById(invoiceId: string): Promise<Invoice | null> {
    return invoiceStore.get(invoiceId) || null;
  }

  static async listByCustomer(customerId: string): Promise<Invoice[]> {
    return Array.from(invoiceStore.values()).filter((i) => i.customerId === customerId);
  }

  static async listByTenant(tenantId: string): Promise<Invoice[]> {
    return Array.from(invoiceStore.values()).filter((i) => i.tenantId === tenantId);
  }

  static clearStore(): void {
    invoiceStore.clear();
    invoiceSequence = 1;
  }
}
