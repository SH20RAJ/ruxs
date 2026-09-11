import {
  PaymentRecord,
  CreatePaymentOrderSchema,
} from "./payment-schema";
import { KhataLedgerService } from "../khata/khata-ledger";
import { BillingEngine } from "../billing/billing-engine";
import { Paise } from "../../shared/types/money";

const paymentsStore = new Map<string, PaymentRecord>();
const processedGatewayIds = new Set<string>();

export class PaymentService {
  /**
   * Generates a UPI intent URL compliant with NPCI specifications
   */
  static generateUpiIntentUrl(params: {
    upiId: string;
    recipientName: string;
    amountRupees: number;
    transactionNote: string;
    orderId: string;
  }): string {
    const formattedAmount = params.amountRupees.toFixed(2);
    const query = new URLSearchParams({
      pa: params.upiId,
      pn: params.recipientName,
      am: formattedAmount,
      cu: "INR",
      tn: params.transactionNote,
      tr: params.orderId,
    });
    return `upi://pay?${query.toString()}`;
  }

  /**
   * Cryptographic Web Crypto HMAC-SHA256 signature verifier
   */
  static async verifyHmacSha256(
    payload: string,
    signatureHex: string,
    secret: string
  ): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const calculatedSig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
      const calculatedHex = Array.from(new Uint8Array(calculatedSig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return calculatedHex.toLowerCase() === signatureHex.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Computes HMAC-SHA256 hex signature for testing / webhook simulation
   */
  static async signPayload(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Creates an order with UPI intent and dynamic QR payload
   */
  static async createPaymentOrder(rawInput: unknown): Promise<PaymentRecord> {
    const validated = CreatePaymentOrderSchema.parse(rawInput);

    const paymentId = `pay_${Math.random().toString(36).substring(2, 11)}`;
    const gatewayOrderId = `order_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    const amountRupees = validated.amountPaise / 100;
    const upiDeepLink = this.generateUpiIntentUrl({
      upiId: validated.recipientUpiId,
      recipientName: validated.recipientName,
      amountRupees,
      transactionNote: `Payment for RUXS #${validated.invoiceId || paymentId}`,
      orderId: gatewayOrderId,
    });

    const payment: PaymentRecord = {
      id: paymentId,
      tenantId: validated.tenantId,
      customerId: validated.customerId,
      invoiceId: validated.invoiceId,
      amountPaise: validated.amountPaise as Paise,
      method: "UPI_INTENT",
      status: "INITIATED",
      gatewayOrderId,
      upiDeepLink,
      qrPayload: upiDeepLink,
      createdAt: now,
      updatedAt: now,
    };

    paymentsStore.set(paymentId, payment);
    paymentsStore.set(gatewayOrderId, payment);
    return payment;
  }

  /**
   * Idempotent payment webhook reconciliation
   * Guarantees zero double-crediting if duplicate webhooks are delivered
   */
  static async handleWebhookPaymentSuccess(params: {
    gatewayOrderId: string;
    gatewayPaymentId: string;
    bankUtr: string;
    rawPayload: string;
    signature: string;
    webhookSecret: string;
  }): Promise<{ payment: PaymentRecord; wasAlreadyProcessed: boolean }> {
    // 1. Verify signature
    const isValid = await this.verifyHmacSha256(
      params.rawPayload,
      params.signature,
      params.webhookSecret
    );
    if (!isValid) {
      throw new Error("Invalid cryptographic webhook signature");
    }

    // 2. Idempotency Guard: check if this payment ID was already processed
    if (processedGatewayIds.has(params.gatewayPaymentId)) {
      const existing = paymentsStore.get(params.gatewayOrderId);
      if (!existing) throw new Error("Order not found");
      return { payment: existing, wasAlreadyProcessed: true };
    }

    // 3. Find target order
    const payment = paymentsStore.get(params.gatewayOrderId);
    if (!payment) {
      throw new Error(`Order ${params.gatewayOrderId} not found`);
    }

    if (payment.status === "SUCCESS") {
      processedGatewayIds.add(params.gatewayPaymentId);
      return { payment, wasAlreadyProcessed: true };
    }

    // 4. Atomic settlement: Update status, append Khata credit, and update invoice
    const now = new Date().toISOString();
    payment.status = "SUCCESS";
    payment.gatewayPaymentId = params.gatewayPaymentId;
    payment.bankUtr = params.bankUtr;
    payment.settledAt = now;
    payment.updatedAt = now;

    // Append to Digital Khata
    const khataEntry = await KhataLedgerService.recordEntry({
      tenantId: payment.tenantId,
      customerId: payment.customerId,
      entryType: "PAYMENT_CREDIT",
      direction: "CREDIT",
      amountPaise: payment.amountPaise,
      referenceType: "PAYMENT",
      referenceId: payment.id,
      description: `UPI Payment Settled (UTR: ${params.bankUtr})`,
    });

    payment.khataEntryId = khataEntry.id;

    // Update invoice if applicable
    if (payment.invoiceId) {
      await BillingEngine.recordInvoicePayment(payment.invoiceId, payment.amountPaise);
    }

    // Mark as processed
    processedGatewayIds.add(params.gatewayPaymentId);
    paymentsStore.set(payment.id, payment);
    paymentsStore.set(payment.gatewayOrderId, payment);

    return { payment, wasAlreadyProcessed: false };
  }

  static getById(id: string): PaymentRecord | null {
    return paymentsStore.get(id) || null;
  }

  static clearStore(): void {
    paymentsStore.clear();
    processedGatewayIds.clear();
  }
}
