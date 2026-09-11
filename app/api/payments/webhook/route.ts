import { PaymentService } from "@/src/modules/payments/payment-service";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";

export async function POST(request: Request) {
  try {
    const rawPayload = await request.text();
    const signature = request.headers.get("x-ruxs-signature") || "";
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || "default_test_webhook_secret_key";

    const body = JSON.parse(rawPayload) as {
      orderId: string;
      paymentId: string;
      utr: string;
    };

    if (!body.orderId || !body.paymentId) {
      return Response.json(
        createErrorResponse("VALIDATION_FAILED", "Missing orderId or paymentId in webhook payload"),
        { status: 400 }
      );
    }

    const result = await PaymentService.handleWebhookPaymentSuccess({
      gatewayOrderId: body.orderId,
      gatewayPaymentId: body.paymentId,
      bankUtr: body.utr || `UTR_${Date.now()}`,
      rawPayload,
      signature,
      webhookSecret,
    });

    return Response.json(createSuccessResponse(result));
  } catch (error) {
    return Response.json(
      createErrorResponse(
        "PAYMENT_FAILED",
        error instanceof Error ? error.message : "Payment processing failed"
      ),
      { status: 400 }
    );
  }
}
