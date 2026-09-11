import { describe, it, expect } from "bun:test";
import { DisputeService } from "./dispute-service";
import { KhataLedgerService } from "../khata/khata-ledger";
import { Paise } from "../../shared/types/money";

describe("Dispute Management & Compensating Khata Refunds", () => {
  it("files a dispute and records customer explanation and evidence", () => {
    const dispute = DisputeService.fileDispute({
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_priya",
      customerName: "Priya Sundaram",
      customerPhone: "+919876543210",
      fulfillmentId: "ful_not_delivered_101",
      reason: "NOT_DELIVERED",
      disputedAmountPaise: 12000, // ₹120.00
      customerComment: "Driver marked delivered at 12:15 PM, but shoerack is empty and doorbell was never rung.",
      driverDeliveredAt: "2026-09-12T12:15:00Z",
      driverDropNotes: "Left outside flat door B-402",
    });

    expect(dispute.id).toBeDefined();
    expect(dispute.status).toBe("OPEN");
    expect(dispute.reason).toBe("NOT_DELIVERED");
    expect(dispute.disputedAmountPaise).toBe(12000);
    expect(dispute.evidence.customerComment).toContain("shoerack is empty");
  });

  it("resolves dispute with FULL_REFUND, automatically executing a compensating CREDIT entry in Digital Khata", async () => {
    const tenantId = "ten_sharma_tiffin";
    const customerId = "usr_dispute_refund_test";

    // Setup: customer had a ₹120 debit for the meal
    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "FULFILLMENT_DEBIT",
      direction: "DEBIT",
      amountPaise: 12000 as Paise,
      description: "Delivered: Executive Veg Lunch Thali",
    });

    const initialStmt = await KhataLedgerService.getCustomerStatement(tenantId, customerId);
    expect(initialStmt.currentBalancePaise).toBe(12000 as Paise); // Customer owes ₹120

    // File dispute
    const dispute = DisputeService.fileDispute({
      tenantId,
      customerId,
      customerName: "Rahul",
      customerPhone: "+919876543211",
      fulfillmentId: "ful_missing_meal",
      reason: "NOT_DELIVERED",
      disputedAmountPaise: 12000,
      customerComment: "Meal was missing",
    });

    // Vendor approves full refund
    const { dispute: resolvedDispute, compensatingEntry } = await DisputeService.resolveDispute(
      dispute.id,
      {
        decision: "FULL_REFUND",
        refundPaise: 12000,
        resolutionNotes: "Driver confirmed dropping at wrong floor C-402. Full refund issued.",
        resolvedBy: "Sharma (Vendor Owner)",
        resolvedAt: new Date().toISOString(),
      }
    );

    expect(resolvedDispute.status).toBe("REFUNDED");
    expect(compensatingEntry).toBeDefined();
    expect(compensatingEntry!.direction).toBe("CREDIT");
    expect(compensatingEntry!.amountPaise).toBe(12000 as Paise);
    expect(compensatingEntry!.referenceType).toBe("DISPUTE");

    // Check customer Khata: balance is now cleared to ₹0
    const finalStmt = await KhataLedgerService.getCustomerStatement(tenantId, customerId);
    expect(finalStmt.currentBalancePaise).toBe(0 as Paise);
  });

  it("resolves dispute as UPHELD_NO_REFUND without altering Khata balance", async () => {
    const tenantId = "ten_sharma_tiffin";
    const customerId = "usr_upheld_test";

    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "FULFILLMENT_DEBIT",
      direction: "DEBIT",
      amountPaise: 12000 as Paise,
      description: "Delivered meal",
    });

    const dispute = DisputeService.fileDispute({
      tenantId,
      customerId,
      customerName: "Kavita",
      customerPhone: "+919876543220",
      fulfillmentId: "ful_late_claim",
      reason: "LATE_DELIVERY",
      disputedAmountPaise: 12000,
      customerComment: "Delivered at 1:15 PM instead of 1:00 PM",
    });

    const { dispute: resolvedDispute, compensatingEntry } = await DisputeService.resolveDispute(
      dispute.id,
      {
        decision: "UPHELD_NO_REFUND",
        refundPaise: 0,
        resolutionNotes: "Delivery completed within SLA window (12:00 PM - 1:30 PM).",
        resolvedBy: "Sharma (Vendor Owner)",
        resolvedAt: new Date().toISOString(),
      }
    );

    expect(resolvedDispute.status).toBe("REJECTED");
    expect(compensatingEntry).toBeUndefined();

    // Khata balance remains ₹120
    const finalStmt = await KhataLedgerService.getCustomerStatement(tenantId, customerId);
    expect(finalStmt.currentBalancePaise).toBe(12000 as Paise);
  });

  it("prevents re-resolving or refunding more than the disputed amount", async () => {
    const dispute = DisputeService.fileDispute({
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_priya",
      customerName: "Priya",
      customerPhone: "+919876543210",
      fulfillmentId: "ful_excess_test",
      reason: "DAMAGED_OR_LEAKING",
      disputedAmountPaise: 12000,
      customerComment: "Dal leaked in dabba",
    });

    // Refund more than ₹120 -> throws
    expect(
      DisputeService.resolveDispute(dispute.id, {
        decision: "FULL_REFUND",
        refundPaise: 20000, // ₹200 > ₹120
        resolutionNotes: "Excess refund test",
        resolvedBy: "Owner",
        resolvedAt: new Date().toISOString(),
      })
    ).rejects.toThrow("cannot exceed the disputed amount");
  });
});
