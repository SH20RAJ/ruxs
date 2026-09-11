import { describe, it, expect, beforeEach } from "bun:test";
import { ServiceCatalogManager } from "./service-catalog";
import { CreateServiceInputSchema } from "./service-schema";
import { toRupees } from "../../shared/types/money";

describe("Service Catalog & Product Management", () => {
  beforeEach(() => {
    ServiceCatalogManager.clearStore();
  });

  it("configures a tiffin meal service with exact integer paise pricing and cutoff window", async () => {
    const tiffinInput = {
      tenantId: "ten_sharma_tiffin",
      category: "TIFFIN",
      name: "Daily Executive Lunch Tiffin",
      description: "Home-style 4 Roti, Sabzi, Dal, Jeera Rice & Salad",
      cutoffTimeStr: "10:00",
      pollTimeStr: "08:30",
      lateCancellationFeePercent: 50,
      requiresAssetTracking: true,
      productName: "Standard Veg Thali",
      unitType: "MEAL",
      priceInRupees: 120, // ₹120.00
    };

    const service = await ServiceCatalogManager.createService(tiffinInput);
    expect(service.id).toStartWith("srv_");
    expect(service.tenantId).toBe("ten_sharma_tiffin");
    expect(service.category).toBe("TIFFIN");
    expect(service.cutoffTimeStr).toBe("10:00");
    expect(service.pollTimeStr).toBe("08:30");
    expect(service.requiresAssetTracking).toBe(true);

    expect(service.products).toHaveLength(1);
    const product = service.products[0];
    expect(product.name).toBe("Standard Veg Thali");
    expect(product.basePricePaise).toBe(12000 as any); // 120 * 100
    expect(toRupees(product.basePricePaise)).toBe(120);

    const tenantList = await ServiceCatalogManager.listServicesByTenant("ten_sharma_tiffin");
    expect(tenantList).toHaveLength(1);
  });

  it("configures a 20L water jar service with asset container tracking", async () => {
    const waterInput = {
      tenantId: "ten_kaveri_water",
      category: "WATER",
      name: "20L Mineral Water Jar Delivery",
      cutoffTimeStr: "07:30",
      pollTimeStr: "06:30",
      lateCancellationFeePercent: 0,
      requiresAssetTracking: true,
      productName: "20L RO Water Jar",
      unitType: "JAR",
      priceInRupees: 40, // ₹40.00 -> 4000 paise
    };

    const service = await ServiceCatalogManager.createService(waterInput);
    expect(service.category).toBe("WATER");
    expect(service.products[0].basePricePaise).toBe(4000 as any);
    expect(service.requiresAssetTracking).toBe(true);
  });

  it("rejects invalid cutoff time formats", () => {
    const invalidTime = {
      tenantId: "ten_test",
      category: "MILK",
      name: "Cow Milk",
      cutoffTimeStr: "9:30 AM", // Not HH:MM 24-hour
      pollTimeStr: "08:00",
      productName: "1L Cow Milk",
      unitType: "LITER",
      priceInRupees: 65,
    };

    expect(() => CreateServiceInputSchema.parse(invalidTime)).toThrow();
  });
});
