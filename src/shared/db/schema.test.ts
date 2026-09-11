import { describe, it, expect } from "bun:test";
import {
  tenants,
  users,
  households,
  householdMembers,
  services,
  products,
  subscriptions,
  dailyFulfillments,
  khataEntries,
  invoices,
  payments,
} from "./schema";
import { validateTenantAccess } from "./index";

describe("Drizzle ORM Schema Integrity & Invariants", () => {
  it("defines all core entities required for the recurring operations loop", () => {
    expect(tenants).toBeDefined();
    expect(users).toBeDefined();
    expect(households).toBeDefined();
    expect(householdMembers).toBeDefined();
    expect(services).toBeDefined();
    expect(products).toBeDefined();
    expect(subscriptions).toBeDefined();
    expect(dailyFulfillments).toBeDefined();
    expect(khataEntries).toBeDefined();
    expect(invoices).toBeDefined();
    expect(payments).toBeDefined();
  });

  it("strictly enforces integer paise column types on financial entities", () => {
    // Products table base price
    expect(products.basePricePaise.dataType).toBe("number");
    
    // Daily fulfillments pricing
    expect(dailyFulfillments.unitPricePaise.dataType).toBe("number");
    expect(dailyFulfillments.totalPricePaise.dataType).toBe("number");

    // Khata ledger entries
    expect(khataEntries.amountPaise.dataType).toBe("number");
    expect(khataEntries.runningBalancePaise.dataType).toBe("number");

    // Invoices and payments
    expect(invoices.totalAmountDuePaise.dataType).toBe("number");
    expect(payments.amountPaise.dataType).toBe("number");
  });

  it("verifies multi-tenant isolation context", () => {
    const vendorA = { tenantId: "tenant_sharma_tiffin", userRole: "VENDOR_ADMIN" };
    const vendorBResource = "tenant_gupta_dairy";

    // Cross-tenant access is strictly denied
    expect(validateTenantAccess(vendorA, vendorBResource)).toBe(false);

    // Same-tenant access is permitted
    expect(validateTenantAccess(vendorA, "tenant_sharma_tiffin")).toBe(true);

    // Platform admin has cross-tenant oversight
    const platformAdmin = { tenantId: "tenant_platform", userRole: "PLATFORM_ADMIN" };
    expect(validateTenantAccess(platformAdmin, vendorBResource)).toBe(true);
  });
});
