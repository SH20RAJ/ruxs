import { describe, it, expect, beforeEach } from "bun:test";
import { BillingEngine } from "./billing-engine";
import { KhataLedgerService } from "../khata/khata-ledger";
import { Paise, toRupees } from "../../shared/types/money";

describe("Monthly Billing Engine & Invoicing", () => {
  beforeEach(() => {
    KhataLedgerService.clearStore();
    BillingEngine.clearStore();
  });

  it("generates an itemized monthly invoice matching unbilled Khata entries", async () => {
    const tenantId = "ten_sharma_tiffin";
    const customerId = "usr_priya";

    // Simulate 3 daily deliveries in September
    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "FULFILLMENT_DEBIT",
      direction: "DEBIT",
      amountPaise: 12000,
      description: "Standard Veg Thali (2026-09-01)",
    });

    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "FULFILLMENT_DEBIT",
      direction: "DEBIT",
      amountPaise: 12000,
      description: "Standard Veg Thali (2026-09-02)",
    });

    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "LATE_FEE_DEBIT",
      direction: "DEBIT",
      amountPaise: 6000,
      description: "Late Skip Fee (2026-09-03)",
    });

    // Generate September monthly invoice
    const invoice = await BillingEngine.generateInvoice({
      tenantId,
      customerId,
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      discountPaise: 0,
    });

    expect(invoice.invoiceNumber).toBe("INV-2026-09-0001");
    expect(invoice.items).toHaveLength(3);
    expect(invoice.subtotalPaise).toBe(30000 as Paise); // ₹300.00
    expect(invoice.totalAmountDuePaise).toBe(30000 as Paise);
    expect(invoice.status).toBe("ISSUED");
    expect(toRupees(invoice.totalAmountDuePaise)).toBe(300);
  });

  it("handles partial invoice payment and transitions status to PAID upon full settlement", async () => {
    const tenantId = "ten_sharma_tiffin";
    const customerId = "usr_rahul";

    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "FULFILLMENT_DEBIT",
      direction: "DEBIT",
      amountPaise: 12000,
      description: "Veg Thali",
    });

    const invoice = await BillingEngine.generateInvoice({
      tenantId,
      customerId,
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
    });

    expect(invoice.totalAmountDuePaise).toBe(12000 as Paise);

    // Partial payment: ₹70 (7000 paise)
    const partial = await BillingEngine.recordInvoicePayment(invoice.id, 7000 as Paise);
    expect(partial.status).toBe("PARTIALLY_PAID");
    expect(partial.amountPaidPaise).toBe(7000 as Paise);

    // Remaining payment: ₹50 (5000 paise)
    const full = await BillingEngine.recordInvoicePayment(invoice.id, 5000 as Paise);
    expect(full.status).toBe("PAID");
    expect(full.paidAt).toBeDefined();
  });
});
