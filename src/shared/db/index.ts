export const isTestEnv = process.env.NODE_ENV === "test";

import * as schema from "./schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export * from "./schema";
export { schema };

const connectionString =
  process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

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
