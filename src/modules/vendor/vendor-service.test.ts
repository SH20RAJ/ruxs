import { describe, it, expect, beforeEach } from "bun:test";
import { VendorService } from "./vendor-service";
import { VendorOnboardingSchema, generateVendorSlug } from "./vendor-schema";

describe("Vendor Onboarding & Profile Service", () => {
  beforeEach(() => {
    VendorService.clearStore();
  });

  it("validates and onboards a legitimate local vendor", async () => {
    const validPayload = {
      businessName: "Sharma Fresh Tiffin",
      phone: "9876543210",
      email: "sharma.tiffin@gmail.com",
      upiId: "sharmatiffin@okhdfcbank",
      primaryCategory: "TIFFIN",
      locality: "HSR Layout Sector 2",
      city: "Bengaluru",
      pincode: "560102",
      coveredSocieties: ["Sobha Classic", "Purva Fairmont"],
    };

    const vendor = await VendorService.onboardVendor(validPayload);
    expect(vendor.id).toStartWith("ten_");
    expect(vendor.businessName).toBe("Sharma Fresh Tiffin");
    expect(vendor.phone).toBe("+919876543210");
    expect(vendor.inviteUrl).toStartWith("https://ruxs.in/v/sharma-fresh-tiffin-hsr-layout-sector-2-");
    expect(vendor.qrPayload).toContain("pa=sharmatiffin@okhdfcbank");

    // Can retrieve by slug
    const fetched = await VendorService.getVendorBySlug(vendor.slug);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(vendor.id);
  });

  it("rejects invalid UPI IDs", () => {
    const invalidUpiPayload = {
      businessName: "Gupta Dairy",
      phone: "9876543210",
      upiId: "not-a-valid-vpa",
      primaryCategory: "MILK",
      locality: "Indiranagar",
      city: "Bengaluru",
      coveredSocieties: ["Prestige Meridian"],
    };

    expect(() => VendorOnboardingSchema.parse(invalidUpiPayload)).toThrow();
  });

  it("rejects empty covered societies", () => {
    const emptySocietiesPayload = {
      businessName: "Kaveri Water Supply",
      phone: "9876543210",
      upiId: "kaveri@upi",
      primaryCategory: "WATER",
      locality: "Whitefield",
      city: "Bengaluru",
      coveredSocieties: [],
    };

    expect(() => VendorOnboardingSchema.parse(emptySocietiesPayload)).toThrow();
  });

  it("generates url-safe vendor slugs", () => {
    const slug = generateVendorSlug("Annapurna Meals & Tiffins!", "Koramangala 4th Block");
    expect(slug).toStartWith("annapurna-meals-tiffins-koramangala-4th-block-");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
});
