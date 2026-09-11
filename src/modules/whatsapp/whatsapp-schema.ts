import { z } from "zod";

export interface WhatsAppInteractiveButton {
  type: "reply";
  reply: {
    id: string; // e.g. "CONFIRM_ful_123"
    title: string; // e.g. "Deliver Today"
  };
}

export interface WhatsAppInteractiveMessage {
  to: string;
  bodyText: string;
  buttons: WhatsAppInteractiveButton[];
}

export const WhatsAppWebhookEntrySchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.string().default("whatsapp"),
            messages: z
              .array(
                z.object({
                  id: z.string(),
                  from: z.string(),
                  timestamp: z.string(),
                  type: z.string(),
                  interactive: z
                    .object({
                      type: z.string(),
                      button_reply: z.object({
                        id: z.string(),
                        title: z.string(),
                      }),
                    })
                    .optional(),
                  text: z
                    .object({
                      body: z.string(),
                    })
                    .optional(),
                })
              )
              .optional(),
          }),
        })
      ),
    })
  ),
});

export type WhatsAppWebhookPayload = z.infer<typeof WhatsAppWebhookEntrySchema>;
