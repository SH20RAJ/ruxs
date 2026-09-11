import { z } from "zod";
import { isValidIndianPhone, normalizeIndianPhone } from "../../shared/auth/phone";

export const DeliveryDropPreferenceEnum = z.enum([
  "DOOR_BAG", // Hang on door handle / bag
  "SECURITY_GATE", // Leave with security guard / gate
  "RING_BELL", // Ring doorbell and handover
]);

export const CustomerOnboardingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  phone: z
    .string()
    .refine((val) => isValidIndianPhone(val), {
      message: "Please enter a valid 10-digit Indian phone number",
    })
    .transform((val) => normalizeIndianPhone(val)),
  whatsappOptIn: z.boolean().default(true),
  societyName: z.string().min(2, "Society/Apartment name is required").trim(),
  towerWing: z.string().min(1, "Tower or Wing is required").trim(),
  floor: z.string().min(1, "Floor is required").trim(),
  flatNumber: z.string().min(1, "Flat/Unit number is required").trim(),
  landmark: z.string().optional().or(z.literal("")),
  city: z.string().default("Bengaluru"),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit PIN code")
    .optional()
    .or(z.literal("")),
  deliveryDropPreference: DeliveryDropPreferenceEnum.default("DOOR_BAG"),
  deliveryNotes: z.string().max(250).optional().or(z.literal("")),
  tenantSlug: z.string().optional(),
});

export type CustomerOnboardingInput = z.infer<typeof CustomerOnboardingSchema>;

export interface CustomerProfile {
  userId: string;
  fullName: string;
  phone: string;
  whatsappOptIn: boolean;
  whatsappOptInAt: string;
  householdId: string;
  societyName: string;
  towerWing: string;
  floor: string;
  flatNumber: string;
  deliveryDropPreference: z.infer<typeof DeliveryDropPreferenceEnum>;
  deliveryNotes?: string;
  linkedTenantSlug?: string;
  createdAt: string;
}
