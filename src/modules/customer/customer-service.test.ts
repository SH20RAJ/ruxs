import { describe, it, expect, beforeEach } from "bun:test";
import { CustomerService } from "./customer-service";
import { CustomerOnboardingSchema } from "./customer-schema";

describe("Customer Onboarding & Domestic Address Service", () => {
  beforeEach(() => {
    CustomerService.clearStore();
  });

  it("successfully registers customer and captures apartment flat hierarchy", async () => {
    const validPayload = {
      fullName: "Priya Sundaram",
      phone: "9876543210",
      whatsappOptIn: true,
      societyName: "Sobha Classic",
      towerWing: "Tower B",
      floor: "4",
      flatNumber: "402",
      landmark: "Near Clubhouse",
      deliveryDropPreference: "DOOR_BAG",
      deliveryNotes: "Leave in red bag on outer grill handle",
      tenantSlug: "sharma-tiffin-services-hsr",
    };

    const customer = await CustomerService.onboardCustomer(validPayload);
    expect(customer.userId).toStartWith("usr_");
    expect(customer.householdId).toStartWith("hh_");
    expect(customer.phone).toBe("+919876543210");
    expect(customer.whatsappOptIn).toBe(true);
    expect(customer.whatsappOptInAt).not.toBeEmpty();
    expect(customer.societyName).toBe("Sobha Classic");
    expect(customer.flatNumber).toBe("402");
    expect(customer.linkedTenantSlug).toBe("sharma-tiffin-services-hsr");

    // Can lookup by normalized phone
    const fetched = await CustomerService.getCustomerByPhone("+919876543210");
    expect(fetched).toBeDefined();
    expect(fetched?.fullName).toBe("Priya Sundaram");
  });

  it("rejects invalid phone numbers during customer onboarding", () => {
    const invalidPhonePayload = {
      fullName: "Rahul Verma",
      phone: "12345",
      societyName: "Prestige Meridian",
      towerWing: "Wing A",
      floor: "2",
      flatNumber: "201",
    };

    expect(() => CustomerOnboardingSchema.parse(invalidPhonePayload)).toThrow();
  });

  it("rejects incomplete flat addresses", () => {
    const missingFlatPayload = {
      fullName: "Rahul Verma",
      phone: "9876543210",
      societyName: "Prestige Meridian",
      towerWing: "Wing A",
      floor: "2",
      flatNumber: "", // Missing flat number
    };

    expect(() => CustomerOnboardingSchema.parse(missingFlatPayload)).toThrow();
  });
});
