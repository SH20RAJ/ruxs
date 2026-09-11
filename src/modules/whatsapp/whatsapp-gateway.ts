import {
  WhatsAppInteractiveMessage,
  WhatsAppWebhookPayload,
  WhatsAppWebhookEntrySchema,
} from "./whatsapp-schema";
import { FulfillmentStateMachine } from "../fulfillment/fulfillment-fsm";

const processedMessageIds = new Set<string>();
const optedOutPhones = new Set<string>();

export class WhatsAppGateway {
  /**
   * Constructs an interactive 2-button WhatsApp template for the morning cutoff poll
   */
  static buildMorningPollMessage(
    toPhone: string,
    fulfillmentId: string,
    serviceName: string,
    cutoffTimeStr: string
  ): WhatsAppInteractiveMessage {
    return {
      to: toPhone,
      bodyText: `🍱 *RUXS Daily Morning Poll*\n\nDelivering your *${serviceName}* today?\n\n⏰ *Cutoff Deadline:* ${cutoffTimeStr} AM\n\nTap below to confirm or skip:`,
      buttons: [
        {
          type: "reply",
          reply: {
            id: `CONFIRM_${fulfillmentId}`,
            title: "✅ Deliver Today",
          },
        },
        {
          type: "reply",
          reply: {
            id: `SKIP_${fulfillmentId}`,
            title: "⏭️ Skip Today",
          },
        },
      ],
    };
  }

  /**
   * Cryptographic verification of Meta's sha256=... signature
   */
  static async verifyMetaSignature(
    rawPayload: string,
    signatureHeader: string,
    appSecret: string
  ): Promise<boolean> {
    if (!signatureHeader.startsWith("sha256=")) {
      return false;
    }
    const signatureHex = signatureHeader.substring(7);

    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(appSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const calculatedSig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawPayload));
      const calculatedHex = Array.from(new Uint8Array(calculatedSig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return calculatedHex.toLowerCase() === signatureHex.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Generates a sha256=... signature for tests and simulated webhooks
   */
  static async generateTestSignature(payload: string, appSecret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(appSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `sha256=${hex}`;
  }

  /**
   * Processes inbound webhook from Meta and routes button replies to fulfillment state machine
   */
  static async processInboundWebhook(rawPayload: unknown): Promise<{
    processedCount: number;
    actionsTaken: string[];
  }> {
    const validated = WhatsAppWebhookEntrySchema.parse(rawPayload);
    const actionsTaken: string[] = [];
    let processedCount = 0;

    for (const entry of validated.entry) {
      for (const change of entry.changes) {
        const messages = change.value.messages || [];

        for (const msg of messages) {
          // Deduplication Guard: Ignore if already processed
          if (processedMessageIds.has(msg.id)) {
            continue;
          }
          processedMessageIds.add(msg.id);
          processedCount++;

          const fromPhone = msg.from;

          // Check for STOP / Opt-Out keywords
          if (msg.type === "text" && msg.text?.body) {
            const bodyClean = msg.text.body.trim().toUpperCase();
            if (bodyClean === "STOP" || bodyClean === "UNSUBSCRIBE") {
              optedOutPhones.add(fromPhone);
              actionsTaken.push(`OPT_OUT_${fromPhone}`);
              continue;
            }
          }

          // Check for interactive button replies
          if (msg.type === "interactive" && msg.interactive?.button_reply) {
            const buttonId = msg.interactive.button_reply.id;

            if (buttonId.startsWith("CONFIRM_")) {
              const fulfillmentId = buttonId.replace("CONFIRM_", "");
              const fulfillment = FulfillmentStateMachine.getById(fulfillmentId);
              if (fulfillment) {
                FulfillmentStateMachine.transition(fulfillment, {
                  action: "CONFIRM",
                  notes: "Confirmed via WhatsApp 1-tap button",
                });
                actionsTaken.push(`CONFIRMED_${fulfillmentId}`);
              }
            } else if (buttonId.startsWith("SKIP_")) {
              const fulfillmentId = buttonId.replace("SKIP_", "");
              const fulfillment = FulfillmentStateMachine.getById(fulfillmentId);
              if (fulfillment) {
                FulfillmentStateMachine.transition(fulfillment, {
                  action: "SKIP",
                  notes: "Skipped via WhatsApp 1-tap button",
                });
                actionsTaken.push(`SKIPPED_${fulfillmentId}`);
              }
            }
          }
        }
      }
    }

    return { processedCount, actionsTaken };
  }

  static isPhoneOptedOut(phone: string): boolean {
    return optedOutPhones.has(phone);
  }

  static clearStore(): void {
    processedMessageIds.clear();
    optedOutPhones.clear();
  }
}
