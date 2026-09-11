import { z } from "zod";
import { isValidIndianPhone, normalizeIndianPhone } from "../../shared/auth/phone";

export const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9]{2,64}$/;

export const VendorOnboardingSchema = z.object({
  businessName: z
    .string()
    .min(3, "Business name must be at least 3 characters")
    .max(100, "Business name cannot exceed 100 characters")
    .trim(),
  phone: z
    .string()
    .refine((val) => isValidIndianPhone(val), {
      message: "Please enter a valid 10-digit Indian phone number",
    })
    .transform((val) => normalizeIndianPhone(val)),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  upiId: z
    .string()
    .regex(UPI_ID_REGEX, "Please enter a valid UPI ID (e.g., merchant@okhdfcbank or 9876543210@paytm)")
    .trim(),
  primaryCategory: z.enum([
    "TIFFIN",
    "WATER",
    "MILK",
    "NEWSPAPER",
    "FLOWERS",
    "LAUNDRY",
    "CAR_CLEANING",
    "WASTE_SCRAP",
  ]),
  locality: z.string().min(2, "Locality/Area name is required").trim(),
  city: z.string().min(2, "City name is required").trim().default("Bengaluru"),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code")
    .optional()
    .or(z.literal("")),
  coveredSocieties: z.array(z.string().min(1)).min(1, "Please add at least one apartment/society you deliver to"),
  fssaiNumber: z
    .string()
    .regex(/^[0-9]{14}$/, "FSSAI registration number must be 14 digits")
    .optional()
    .or(z.literal("")),
});

export type VendorOnboardingInput = z.infer<typeof VendorOnboardingSchema>;

export interface VendorProfile {
  id: string;
  businessName: string;
  slug: string;
  phone: string;
  upiId: string;
  primaryCategory: string;
  locality: string;
  city: string;
  coveredSocieties: string[];
  inviteUrl: string;
  qrPayload: string;
  status: "ACTIVE" | "PENDING";
  createdAt: string;
}

/**
 * Converts a business name and locality to a clean URL slug
 */
export function generateVendorSlug(businessName: string, locality: string): string {
  const cleanName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const cleanLocality = locality
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const base = `${cleanName}-${cleanLocality}`.slice(0, 50);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
}
