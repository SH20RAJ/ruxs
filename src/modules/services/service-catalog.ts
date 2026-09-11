import {
  CreateServiceInputSchema,
  ServiceDefinition,
  ServiceProductItem,
} from "./service-schema";
import { toPaise } from "../../shared/types/money";
import { db, isTestEnv } from "../../shared/db";
import { services as servicesTable, products as productsTable } from "../../shared/db/schema";
import { eq } from "drizzle-orm";

const servicesStore = new Map<string, ServiceDefinition[]>();

export class ServiceCatalogManager {
  /**
   * Creates a new service offering and its default product SKU
   */
  static async createService(rawInput: unknown): Promise<ServiceDefinition> {
    const validated = CreateServiceInputSchema.parse(rawInput);

    const serviceId = `srv_${Math.random().toString(36).substring(2, 11)}`;
    const productId = `prd_${Math.random().toString(36).substring(2, 11)}`;

    const product: ServiceProductItem = {
      id: productId,
      name: validated.productName,
      unitType: validated.unitType,
      basePricePaise: toPaise(validated.priceInRupees),
      isAddon: false,
      isActive: true,
    };

    const service: ServiceDefinition = {
      id: serviceId,
      tenantId: validated.tenantId,
      category: validated.category,
      name: validated.name,
      description: validated.description,
      cutoffTimeStr: validated.cutoffTimeStr,
      pollTimeStr: validated.pollTimeStr,
      lateCancellationFeePercent: validated.lateCancellationFeePercent,
      requiresAssetTracking: validated.requiresAssetTracking,
      allowsQuantityAdjustment: validated.allowsQuantityAdjustment,
      allowsSkip: validated.allowsSkip,
      products: [product],
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const tenantServices = servicesStore.get(validated.tenantId) || [];
    tenantServices.push(service);
    servicesStore.set(validated.tenantId, tenantServices);

    if (!isTestEnv) {
      try {
        await db.insert(servicesTable).values({
          id: serviceId,
          tenantId: validated.tenantId,
          category: validated.category,
          name: validated.name,
          description: validated.description,
          cutoffTimeStr: validated.cutoffTimeStr,
          lateCancellationFeePercent: validated.lateCancellationFeePercent,
          requiresAssetTracking: validated.requiresAssetTracking,
          allowsQuantityAdjustment: validated.allowsQuantityAdjustment,
          allowsSkip: validated.allowsSkip,
          isActive: true,
        });

        await db.insert(productsTable).values({
          id: productId,
          tenantId: validated.tenantId,
          serviceId,
          name: validated.productName,
          unitType: validated.unitType,
          basePricePaise: toPaise(validated.priceInRupees),
          isAddon: false,
          isActive: true,
        });
      } catch {
        // In-memory fallback succeeds
      }
    }

    return service;
  }

  /**
   * Lists all services and attached products for a specific vendor tenant
   */
  static async listServicesByTenant(tenantId: string): Promise<ServiceDefinition[]> {
    if (!isTestEnv) {
      try {
        const dbServices = await db
          .select()
          .from(servicesTable)
          .where(eq(servicesTable.tenantId, tenantId));

        if (dbServices && dbServices.length > 0) {
          const result: ServiceDefinition[] = [];
          for (const s of dbServices) {
            const dbProducts = await db
              .select()
              .from(productsTable)
              .where(eq(productsTable.serviceId, s.id));

            result.push({
              id: s.id,
              tenantId: s.tenantId,
              category: s.category as any,
              name: s.name,
              description: s.description ?? undefined,
              cutoffTimeStr: s.cutoffTimeStr,
              pollTimeStr: "08:30",
              lateCancellationFeePercent: s.lateCancellationFeePercent,
              requiresAssetTracking: s.requiresAssetTracking,
              allowsQuantityAdjustment: s.allowsQuantityAdjustment,
              allowsSkip: s.allowsSkip,
              products: dbProducts.map((p) => ({
                id: p.id,
                name: p.name,
                unitType: p.unitType as any,
                basePricePaise: p.basePricePaise as any,
                isAddon: p.isAddon,
                isActive: p.isActive,
              })),
              isActive: s.isActive,
              createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
            });
          }
          return result;
        }
      } catch {
        // In-memory fallback
      }
    }

    return servicesStore.get(tenantId) || [];
  }

  /**
   * Retrieves a specific service by ID
   */
  static async getServiceById(tenantId: string, serviceId: string): Promise<ServiceDefinition | null> {
    const list = await this.listServicesByTenant(tenantId);
    return list.find((s) => s.id === serviceId) || null;
  }

  /**
   * Resets services in-memory (for tests)
   */
  static clearStore(): void {
    servicesStore.clear();
  }
}
