import { describe, it, expect } from "bun:test";
import { AdminService } from "./admin-service";

describe("Platform Administration & Immutable Audit Trail", () => {
  const adminUser = {
    userId: "usr_admin_master",
    email: "ops@ruxs.in",
  };

  it("registers a local vendor and handles admin verification with audit logging", () => {
    const vendor = AdminService.registerVendor({
      id: "ten_gupta_dairy",
      businessName: "Gupta Pure Cow Milk",
      slug: "gupta-pure-cow-milk",
      phone: "+919876543230",
      serviceCategories: ["MILK"],
      coveredSocieties: ["Sobha Classic", "Purva Fairmont"],
    });

    expect(vendor.status).toBe("PENDING_VERIFICATION");
    expect(vendor.tier).toBe("STARTER");

    // Admin verifies vendor
    const verifiedVendor = AdminService.verifyVendor(vendor.id, adminUser);
    expect(verifiedVendor.status).toBe("VERIFIED");
    expect(verifiedVendor.verifiedAt).toBeDefined();

    // Verify audit log entry
    const logs = AdminService.getAuditLogs(10);
    const verifyLog = logs.find((l) => l.action === "VENDOR_APPROVED" && l.targetId === vendor.id);
    expect(verifyLog).toBeDefined();
    expect(verifyLog!.adminEmail).toBe("ops@ruxs.in");
    expect(verifyLog!.details).toContain("verified and approved");
  });

  it("updates vendor SaaS plan tier and records audit attribution", () => {
    const vendor = AdminService.registerVendor({
      id: "ten_aqua_pure",
      businessName: "Aqua Pure Water Suppliers",
      slug: "aqua-pure-water",
      phone: "+919876543231",
      serviceCategories: ["WATER"],
      coveredSocieties: ["Sobha Classic"],
      tier: "STARTER",
    });

    const upgraded = AdminService.updateVendorTier(vendor.id, "PRO", adminUser);
    expect(upgraded.tier).toBe("PRO");

    const logs = AdminService.getAuditLogs(5);
    const upgradeLog = logs.find((l) => l.action === "PLAN_UPGRADED" && l.targetId === vendor.id);
    expect(upgradeLog).toBeDefined();
    expect(upgradeLog!.details).toContain("STARTER to PRO");
  });

  it("suspends a vendor with reason and records in immutable audit log", () => {
    const vendor = AdminService.registerVendor({
      id: "ten_bad_service",
      businessName: "Flaky Tiffin Provider",
      slug: "flaky-tiffin",
      phone: "+919876543232",
      serviceCategories: ["TIFFIN"],
      coveredSocieties: ["Prestige Shantiniketan"],
      status: "VERIFIED",
    });

    const suspended = AdminService.suspendVendor(
      vendor.id,
      "Customer complaints exceeding 15% threshold for rotten food",
      adminUser
    );

    expect(suspended.status).toBe("SUSPENDED");

    const logs = AdminService.getAuditLogs(5);
    const suspendLog = logs.find((l) => l.action === "VENDOR_SUSPENDED" && l.targetId === vendor.id);
    expect(suspendLog).toBeDefined();
    expect(suspendLog!.details).toContain("Customer complaints exceeding 15%");
  });
});
