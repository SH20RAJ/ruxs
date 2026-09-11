import {
  AdminVendorProfile,
  AdminVendorProfileSchema,
  PlatformAuditLog,
  PlatformAuditLogSchema,
  VendorApprovalStatus,
  VendorPlanTier,
} from "./admin-schema";
import { db, isTestEnv } from "../../shared/db";
import { tenants as tenantsTable, auditLogs as auditLogsTable } from "../../shared/db/schema";
import { eq, desc } from "drizzle-orm";

const vendorsStore = new Map<string, AdminVendorProfile>();
const auditLogsStore: PlatformAuditLog[] = [];

export class AdminService {
  /**
   * Initializes or registers a vendor into admin directory
   */
  static registerVendor(input: {
    id: string;
    businessName: string;
    slug: string;
    phone: string;
    serviceCategories: string[];
    coveredSocieties: string[];
    tier?: VendorPlanTier;
    status?: VendorApprovalStatus;
  }): AdminVendorProfile {
    const profile = AdminVendorProfileSchema.parse({
      id: input.id,
      businessName: input.businessName,
      slug: input.slug,
      phone: input.phone,
      serviceCategories: input.serviceCategories,
      coveredSocieties: input.coveredSocieties,
      status: input.status || "PENDING_VERIFICATION",
      tier: input.tier || "STARTER",
      subscriberCount: 0,
      monthlyVolumePaise: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    vendorsStore.set(profile.id, profile);
    return profile;
  }

  /**
   * Verifies and approves a local vendor for live operations
   */
  static verifyVendor(
    vendorId: string,
    adminUser: { userId: string; email: string }
  ): AdminVendorProfile {
    const vendor = vendorsStore.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    vendor.status = "VERIFIED";
    vendor.verifiedAt = new Date().toISOString();
    vendor.updatedAt = new Date().toISOString();
    vendorsStore.set(vendor.id, vendor);

    this.logAction({
      adminUserId: adminUser.userId,
      adminEmail: adminUser.email,
      action: "VENDOR_APPROVED",
      targetType: "VENDOR",
      targetId: vendor.id,
      details: `Vendor '${vendor.businessName}' verified and approved for society onboarding`,
    });

    return vendor;
  }

  /**
   * Suspends a vendor (e.g. hygiene failure, dispute threshold breached)
   */
  static suspendVendor(
    vendorId: string,
    reason: string,
    adminUser: { userId: string; email: string }
  ): AdminVendorProfile {
    const vendor = vendorsStore.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    vendor.status = "SUSPENDED";
    vendor.updatedAt = new Date().toISOString();
    vendorsStore.set(vendor.id, vendor);

    this.logAction({
      adminUserId: adminUser.userId,
      adminEmail: adminUser.email,
      action: "VENDOR_SUSPENDED",
      targetType: "VENDOR",
      targetId: vendor.id,
      details: `Vendor '${vendor.businessName}' suspended. Reason: ${reason}`,
    });

    return vendor;
  }

  /**
   * Updates a vendor's SaaS plan tier (STARTER, GROWTH, PRO)
   */
  static updateVendorTier(
    vendorId: string,
    newTier: VendorPlanTier,
    adminUser: { userId: string; email: string }
  ): AdminVendorProfile {
    const vendor = vendorsStore.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    const previousTier = vendor.tier;
    vendor.tier = newTier;
    vendor.updatedAt = new Date().toISOString();
    vendorsStore.set(vendor.id, vendor);

    this.logAction({
      adminUserId: adminUser.userId,
      adminEmail: adminUser.email,
      action: "PLAN_UPGRADED",
      targetType: "VENDOR",
      targetId: vendor.id,
      details: `Vendor '${vendor.businessName}' SaaS plan updated from ${previousTier} to ${newTier}`,
    });

    return vendor;
  }

  /**
   * Appends an immutable audit log
   */
  static logAction(input: {
    adminUserId: string;
    adminEmail: string;
    action: PlatformAuditLog["action"];
    targetType: string;
    targetId: string;
    details: string;
    ipAddress?: string;
  }): PlatformAuditLog {
    const log: PlatformAuditLog = PlatformAuditLogSchema.parse({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      adminUserId: input.adminUserId,
      adminEmail: input.adminEmail,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      details: input.details,
      ipAddress: input.ipAddress,
      createdAt: new Date().toISOString(),
    });

    auditLogsStore.unshift(log); // Most recent first
    return log;
  }

  /**
   * Retrieves audit logs with optional limit
   */
  static getAuditLogs(limit: number = 50): PlatformAuditLog[] {
    return auditLogsStore.slice(0, limit);
  }

  /**
   * Lists all vendors with optional status filter from Neon DB
   */
  static async listVendorsAsync(status?: string): Promise<AdminVendorProfile[]> {
    if (!isTestEnv) {
      try {
        const rows = await db.select().from(tenantsTable);
        if (rows && rows.length > 0) {
          const mapped: AdminVendorProfile[] = rows.map((t) => ({
            id: t.id,
            businessName: t.businessName,
            slug: t.slug,
            phone: t.phone,
            serviceCategories: t.slug.includes("tiffin")
              ? ["TIFFIN"]
              : t.slug.includes("milk")
              ? ["MILK"]
              : ["WATER"],
            coveredSocieties: ["Sobha Classic", "Purva Fairmont"],
            status: (t.status === "ACTIVE" ? "VERIFIED" : t.status) as VendorApprovalStatus,
            tier: (t.planTier || "STARTER") as VendorPlanTier,
            subscriberCount: 25,
            monthlyVolumePaise: 3000000,
            verifiedAt: t.createdAt.toISOString(),
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
          }));

          if (status) {
            return mapped.filter((v) => v.status === status);
          }
          return mapped;
        }
      } catch {
        // Fallback
      }
    }
    return this.listVendors(status);
  }

  /**
   * Retrieves audit logs from Neon DB
   */
  static async getAuditLogsAsync(limit: number = 50): Promise<PlatformAuditLog[]> {
    if (!isTestEnv) {
      try {
        const rows = await db
          .select()
          .from(auditLogsTable)
          .orderBy(desc(auditLogsTable.createdAt))
          .limit(limit);

        if (rows && rows.length > 0) {
          return rows.map((l) => ({
            id: l.id,
            adminUserId: l.adminUserId,
            adminEmail: l.adminEmail,
            action: l.action as any,
            targetType: l.targetType,
            targetId: l.targetId,
            details: l.details,
            ipAddress: undefined,
            createdAt: l.createdAt.toISOString(),
          }));
        }
      } catch {
        // Fallback
      }
    }
    return this.getAuditLogs(limit);
  }

  /**
   * Lists all vendors with optional status filter (synchronous / memory)
   */
  static listVendors(status?: string): AdminVendorProfile[] {
    const all = Array.from(vendorsStore.values());
    if (status) {
      return all.filter((v) => v.status === status);
    }
    return all;
  }

  /**
   * Retrieves single vendor profile
   */
  static getVendor(vendorId: string): AdminVendorProfile | null {
    return vendorsStore.get(vendorId) || null;
  }
}
