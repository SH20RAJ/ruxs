import {
  CustomerOnboardingInput,
  CustomerProfile,
  CustomerOnboardingSchema,
} from "./customer-schema";

const customerStore = new Map<string, CustomerProfile>();

export class CustomerService {
  /**
   * Onboards a domestic customer and sets up their household profile
   */
  static async onboardCustomer(rawInput: unknown): Promise<CustomerProfile> {
    const validated = CustomerOnboardingSchema.parse(rawInput);

    const userId = `usr_${Math.random().toString(36).substring(2, 11)}`;
    const householdId = `hh_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    const profile: CustomerProfile = {
      userId,
      fullName: validated.fullName,
      phone: validated.phone,
      whatsappOptIn: validated.whatsappOptIn,
      whatsappOptInAt: validated.whatsappOptIn ? now : "",
      householdId,
      societyName: validated.societyName,
      towerWing: validated.towerWing,
      floor: validated.floor,
      flatNumber: validated.flatNumber,
      deliveryDropPreference: validated.deliveryDropPreference,
      deliveryNotes: validated.deliveryNotes,
      linkedTenantSlug: validated.tenantSlug,
      createdAt: now,
    };

    customerStore.set(userId, profile);
    customerStore.set(validated.phone, profile);

    return profile;
  }

  /**
   * Look up customer profile by verified phone number
   */
  static async getCustomerByPhone(phone: string): Promise<CustomerProfile | null> {
    return customerStore.get(phone) || null;
  }

  /**
   * Clear in-memory store (for testing)
   */
  static clearStore(): void {
    customerStore.clear();
  }
}
