import * as schema from "./schema";

export * from "./schema";
export { schema };

// Type helper for schema
export type DatabaseSchema = typeof schema;

/**
 * Tenant Isolation Helper
 * Every multi-tenant database query must scope by tenant_id
 */
export interface TenantContext {
  tenantId: string;
  userId?: string;
  userRole?: string;
}

export function validateTenantAccess(context: TenantContext, resourceTenantId: string): boolean {
  if (context.userRole === "PLATFORM_ADMIN") return true;
  return context.tenantId === resourceTenantId;
}
