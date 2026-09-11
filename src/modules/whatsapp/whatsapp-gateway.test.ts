import { describe, it, expect, beforeEach } from "bun:test";
import { WhatsAppGateway } from "./whatsapp-gateway";
import { FulfillmentStateMachine } from "../fulfillment/fulfillment-fsm";
import { DailyFulfillment } from "../fulfillment/fulfillment-schema";
import { Paise } from "../../shared/types/money";

describe("WhatsApp Cloud API & Interactive Gateway", () => {
  const appSecret = "meta_app_secret_test_key";

  beforeEach(() => {
    WhatsAppGateway.clearStore();
    FulfillmentStateMachine.clearStore();
  });

  it("builds an interactive morning poll message with 2 buttons", () => {
    const poll = WhatsAppGateway.buildMorningPollMessage(
      "+919876543210",
      "ful_123",
      "Executive Lunch Thali",
      "10:00"
    );

    expect(poll.to).toBe("+919876543210");
    expect(poll.bodyText).toContain("RUXS Daily Morning Poll");
    expect(poll.bodyText).toContain("10:00 AM");
    expect(poll.buttons).toHaveLength(2);
    expect(poll.buttons[0].reply.id).toBe("CONFIRM_ful_123");
    expect(poll.buttons[1].reply.id).toBe("SKIP_ful_123");
  });

  it("verifies Meta sha256=... signature and rejects forged payloads", async () => {
    const payload = JSON.stringify({ test: "data" });
    const validSig = await WhatsAppGateway.generateTestSignature(payload, appSecret);

    const isValid = await WhatsAppGateway.verifyMetaSignature(payload, validSig, appSecret);
    expect(isValid).toBe(true);

    const invalidSig = "sha256=0000000000000000000000000000000000000000000000000000000000000000";
    const isInvalid = await WhatsAppGateway.verifyMetaSignature(payload, invalidSig, appSecret);
    expect(isInvalid).toBe(false);
  });

  it("routes interactive SKIP button tap directly to fulfillment state machine", async () => {
    const fulfillmentId = "ful_whatsapp_skip";
    const fulfillment: DailyFulfillment = {
      id: fulfillmentId,
      tenantId: "ten_sharma_tiffin",
      subscriptionId: "sub_1",
      customerId: "usr_priya",
      serviceDate: "2026-09-12",
      shift: "LUNCH",
      status: "CONFIRMATION_REQUIRED",
      items: [],
      totalPricePaise: 12000 as Paise,
      cutoffTime: "2026-09-12T10:00:00.000Z",
      createdAt: "2026-09-12T00:01:00Z",
      updatedAt: "2026-09-12T00:01:00Z",
    };
    FulfillmentStateMachine.save(fulfillment);

    const webhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "entry_1",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                messages: [
                  {
                    id: "wamid.HBgLMjA2...",
                    from: "919876543210",
                    timestamp: "1726050000",
                    type: "interactive",
                    interactive: {
                      type: "button_reply",
                      button_reply: {
                        id: `SKIP_${fulfillmentId}`,
                        title: "Skip Today",
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = await WhatsAppGateway.processInboundWebhook(webhookPayload);
    expect(result.processedCount).toBe(1);
    expect(result.actionsTaken).toContain(`SKIPPED_${fulfillmentId}`);

    // Verify fulfillment in store is now SKIPPED
    const updated = FulfillmentStateMachine.getById(fulfillmentId);
    expect(updated?.status).toBe("SKIPPED");
  });

  it("handles STOP opt-out keyword to immediately suppress messaging", async () => {
    const webhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "entry_1",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                messages: [
                  {
                    id: "wamid.optout_123",
                    from: "919876543210",
                    timestamp: "1726050000",
                    type: "text",
                    text: {
                      body: "STOP",
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = await WhatsAppGateway.processInboundWebhook(webhookPayload);
    expect(result.actionsTaken).toContain("OPT_OUT_919876543210");
    expect(WhatsAppGateway.isPhoneOptedOut("919876543210")).toBe(true);
  });
});
