import {
  CreateServiceInputSchema,
  ServiceDefinition,
  ServiceProductItem,
} from "./service-schema";
import { toPaise } from "../../shared/types/money";

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

    return service;
  }

  /**
   * Lists all services and attached products for a specific vendor tenant
   */
  static async listServicesByTenant(tenantId: string): Promise<ServiceDefinition[]> {
    return servicesStore.get(tenantId) || [];
  }

  /**
   * Retrieves a specific service by ID
   */
  static async getServiceById(tenantId: string, serviceId: string): Promise<ServiceDefinition | null> {
    const list = servicesStore.get(tenantId) || [];
    return list.find((s) => s.id === serviceId) || null;
  }

  /**
   * Resets services in-memory (for tests)
   */
  static clearStore(): void {
    servicesStore.clear();
  }
}
