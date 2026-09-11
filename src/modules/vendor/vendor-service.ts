import {
  VendorOnboardingInput,
  VendorProfile,
  generateVendorSlug,
  VendorOnboardingSchema,
} from "./vendor-schema";

// In-memory mock store for immediate edge & unit-test reliability
const vendorStore = new Map<string, VendorProfile>();

export class VendorService {
  /**
   * Onboards a new vendor business and provisions their public subscriber invite portal
   */
  static async onboardVendor(rawInput: unknown): Promise<VendorProfile> {
    const validated = VendorOnboardingSchema.parse(rawInput);

    const vendorId = `ten_${Math.random().toString(36).substring(2, 11)}`;
    const slug = generateVendorSlug(validated.businessName, validated.locality);
    const inviteUrl = `https://ruxs.in/v/${slug}`;
    const qrPayload = `upi://pay?pa=${validated.upiId}&pn=${encodeURIComponent(
      validated.businessName
    )}&cu=INR`;

    const profile: VendorProfile = {
      id: vendorId,
      businessName: validated.businessName,
      slug,
      phone: validated.phone,
      upiId: validated.upiId,
      primaryCategory: validated.primaryCategory,
      locality: validated.locality,
      city: validated.city,
      coveredSocieties: validated.coveredSocieties,
      inviteUrl,
      qrPayload,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    vendorStore.set(vendorId, profile);
    vendorStore.set(slug, profile);

    return profile;
  }

  /**
   * Retrieves a vendor by public slug
   */
  static async getVendorBySlug(slug: string): Promise<VendorProfile | null> {
    return vendorStore.get(slug) || null;
  }

  /**
   * Clears the store (for testing)
   */
  static clearStore(): void {
    vendorStore.clear();
  }
}
