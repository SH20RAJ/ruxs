import { WhatsAppGateway } from "@/src/modules/whatsapp/whatsapp-gateway";
import { createErrorResponse } from "@/src/shared/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "ruxs_meta_verify_token_prod";

  if (mode === "subscribe" && token === expectedToken) {
    return new Response(challenge || "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const rawPayload = await request.text();
    const signature = request.headers.get("x-hub-signature-256") || "";
    const appSecret = process.env.WHATSAPP_APP_SECRET || "ruxs_meta_app_secret";

    // If signature provided in production, verify it
    if (signature) {
      const isValid = await WhatsAppGateway.verifyMetaSignature(rawPayload, signature, appSecret);
      if (!isValid) {
        return Response.json(
          createErrorResponse("FORBIDDEN", "Invalid Meta cryptographic webhook signature"),
          { status: 403 }
        );
      }
    }

    const payload = JSON.parse(rawPayload);
    const result = await WhatsAppGateway.processInboundWebhook(payload);

    return new Response(JSON.stringify({ status: "ok", ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("WhatsApp webhook processing error:", error);
    // Meta requires 200/OK even on errors to prevent endless retries
    return new Response(JSON.stringify({ status: "error", message: (error as Error).message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
