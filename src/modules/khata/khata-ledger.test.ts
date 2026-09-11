import { describe, it, expect, beforeEach } from "bun:test";
import { KhataLedgerService } from "./khata-ledger";
import { toRupees } from "../../shared/types/money";

describe("Digital Khata Ledger & Financial Invariants", () => {
  beforeEach(() => {
    KhataLedgerService.clearStore();
  });

  it("appends daily fulfillment debits and tracks running balance accurately", async () => {
    const tenantId = "ten_sharma_tiffin";
    const customerId = "usr_priya";

    // Day 1: Lunch delivered (+₹120)
    const e1 = await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "FULFILLMENT_DEBIT",
      direction: "DEBIT",
      amountPaise: 12000,
      description: "Daily Lunch Tiffin Delivery (2026-09-01)",
    });
    expect(e1.runningBalancePaise).toBe(12000 as any);

    // Day 2: Lunch delivered (+₹120)
    const e2 = await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "FULFILLMENT_DEBIT",
      direction: "DEBIT",
      amountPaise: 12000,
      description: "Daily Lunch Tiffin Delivery (2026-09-02)",
    });
    expect(e2.runningBalancePaise).toBe(24000 as any); // ₹240

    // Day 3: Late skip cancellation (+₹60)
    const e3 = await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "LATE_FEE_DEBIT",
      direction: "DEBIT",
      amountPaise: 6000,
      description: "Late Cancellation Fee 50% (2026-09-03)",
    });
    expect(e3.runningBalancePaise).toBe(30000 as any); // ₹300

    // Day 4: Customer pays via UPI (-₹200)
    const e4 = await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "PAYMENT_CREDIT",
      direction: "CREDIT",
      amountPaise: 20000,
      referenceType: "PAYMENT",
      referenceId: "pay_upi_12345",
      description: "UPI Payment Received via PhonePe",
    });
    expect(e4.runningBalancePaise).toBe(10000 as any); // ₹100 remaining

    // Get final statement
    const statement = await KhataLedgerService.getCustomerStatement(tenantId, customerId);
    expect(statement.entries).toHaveLength(4);
    expect(statement.totalDebitsPaise).toBe(30000 as any); // ₹300
    expect(statement.totalCreditsPaise).toBe(20000 as any); // ₹200
    expect(statement.currentBalancePaise).toBe(10000 as any); // ₹100
    expect(toRupees(statement.currentBalancePaise)).toBe(100);

    // Verify mathematical integrity
    expect(KhataLedgerService.verifyIntegrity(tenantId, customerId)).toBe(true);
  });

  it("handles promotional discount credits and full clearing payments", async () => {
    const tenantId = "ten_sharma_tiffin";
    const customerId = "usr_rahul";

    // 1 Meal: ₹120
    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "FULFILLMENT_DEBIT",
      direction: "DEBIT",
      amountPaise: 12000,
      description: "Lunch Tiffin",
    });

    // ₹20 introductory discount
    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "DISCOUNT_CREDIT",
      direction: "CREDIT",
      amountPaise: 2000,
      description: "Welcome Discount",
    });

    // Customer clears remaining ₹100
    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "PAYMENT_CREDIT",
      direction: "CREDIT",
      amountPaise: 10000,
      description: "Google Pay UPI Payment",
    });

    const statement = await KhataLedgerService.getCustomerStatement(tenantId, customerId);
    expect(statement.currentBalancePaise).toBe(0 as any);
    expect(KhataLedgerService.verifyIntegrity(tenantId, customerId)).toBe(true);
  });
});
