import { describe, it, expect, beforeEach } from "bun:test";
import { PaymentService } from "./payment-service";
import { KhataLedgerService } from "../khata/khata-ledger";
import { BillingEngine } from "../billing/billing-engine";
import { Paise } from "../../shared/types/money";

describe("UPI Payments & Idempotent Webhook Reconciliation", () => {
  const webhookSecret = "super_secret_webhook_key_12345";

  beforeEach(() => {
    KhataLedgerService.clearStore();
    BillingEngine.clearStore();
    PaymentService.clearStore();
  });

  it("generates a valid NPCI-compliant UPI intent deep link", () => {
    const url = PaymentService.generateUpiIntentUrl({
      upiId: "merchant@okhdfcbank",
      recipientName: "Sharma Fresh Tiffin",
      amountRupees: 120.5,
      transactionNote: "RUXS Daily Meal",
      orderId: "order_9999",
    });

    expect(url).toStartWith("upi://pay?");
    expect(url).toContain("pa=merchant%40okhdfcbank");
    expect(url).toContain("am=120.50");
    expect(url).toContain("cu=INR");
    expect(url).toContain("tr=order_9999");
  });

  it("creates a payment order with UPI intent and qr payload", async () => {
    const order = await PaymentService.createPaymentOrder({
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_priya",
      amountPaise: 12000,
      recipientUpiId: "sharmatiffin@upi",
      recipientName: "Sharma Tiffin",
    });

    expect(order.id).toStartWith("pay_");
    expect(order.gatewayOrderId).toStartWith("order_");
    expect(order.status).toBe("INITIATED");
    expect(order.upiDeepLink).toContain("pa=sharmatiffin%40upi");
  });

  it("verifies HMAC-SHA256 signatures and rejects forged webhooks", async () => {
    const payload = JSON.stringify({ orderId: "order_123", amount: 12000 });
    const validSignature = await PaymentService.signPayload(payload, webhookSecret);

    // Valid signature passes
    const isValid = await PaymentService.verifyHmacSha256(payload, validSignature, webhookSecret);
    expect(isValid).toBe(true);

    // Tampered payload fails
    const tamperedPayload = JSON.stringify({ orderId: "order_123", amount: 99999 });
    const isTamperedValid = await PaymentService.verifyHmacSha256(tamperedPayload, validSignature, webhookSecret);
    expect(isTamperedValid).toBe(false);
  });

  it("idempotently processes webhook payment success without duplicate ledger credits", async () => {
    const tenantId = "ten_sharma_tiffin";
    const customerId = "usr_priya";

    // Setup: customer owes ₹300 in Khata
    await KhataLedgerService.recordEntry({
      tenantId,
      customerId,
      entryType: "FULFILLMENT_DEBIT",
      direction: "DEBIT",
      amountPaise: 30000,
      description: "Monthly Tiffins",
    });

    // Create payment order for ₹300
    const order = await PaymentService.createPaymentOrder({
      tenantId,
      customerId,
      amountPaise: 30000,
      recipientUpiId: "sharmatiffin@upi",
      recipientName: "Sharma Tiffin",
    });

    const webhookBody = JSON.stringify({
      orderId: order.gatewayOrderId,
      paymentId: "pay_rzp_987654",
      utr: "BANK_UTR_202609123456",
      status: "captured",
    });
    const signature = await PaymentService.signPayload(webhookBody, webhookSecret);

    // 1st Webhook delivery
    const firstResult = await PaymentService.handleWebhookPaymentSuccess({
      gatewayOrderId: order.gatewayOrderId,
      gatewayPaymentId: "pay_rzp_987654",
      bankUtr: "BANK_UTR_202609123456",
      rawPayload: webhookBody,
      signature,
      webhookSecret,
    });

    expect(firstResult.wasAlreadyProcessed).toBe(false);
    expect(firstResult.payment.status).toBe("SUCCESS");
    expect(firstResult.payment.bankUtr).toBe("BANK_UTR_202609123456");

    // Khata statement should show balance is now ₹0
    const statementAfterFirst = await KhataLedgerService.getCustomerStatement(tenantId, customerId);
    expect(statementAfterFirst.entries).toHaveLength(2); // 1 debit + 1 payment credit
    expect(statementAfterFirst.currentBalancePaise).toBe(0 as Paise);

    // 2nd Duplicate Webhook delivery (Network retry from gateway)
    const secondResult = await PaymentService.handleWebhookPaymentSuccess({
      gatewayOrderId: order.gatewayOrderId,
      gatewayPaymentId: "pay_rzp_987654",
      bankUtr: "BANK_UTR_202609123456",
      rawPayload: webhookBody,
      signature,
      webhookSecret,
    });

    expect(secondResult.wasAlreadyProcessed).toBe(true);

    // Khata statement must STILL have only 2 entries (ZERO double credit!)
    const statementAfterSecond = await KhataLedgerService.getCustomerStatement(tenantId, customerId);
    expect(statementAfterSecond.entries).toHaveLength(2);
    expect(statementAfterSecond.currentBalancePaise).toBe(0 as Paise);
  });
});
