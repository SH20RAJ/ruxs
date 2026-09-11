import { describe, it, expect } from "bun:test";
import { HouseholdService } from "./household-service";

describe("Household & Shared Accounts Service", () => {
  it("creates a unified household and establishes creator as PRIMARY_OWNER with billing liability", () => {
    const household = HouseholdService.createHousehold({
      name: "Sobha B-402 Flatmates",
      primaryOwnerId: "usr_priya",
      ownerName: "Priya Sundaram",
      ownerPhone: "9876543210",
      societyName: "Sobha Classic",
      towerWing: "Tower B",
      floor: "4",
      flatNumber: "B-402",
      city: "Bengaluru",
    });

    expect(household.id).toBeDefined();
    expect(household.name).toBe("Sobha B-402 Flatmates");
    expect(household.primaryOwnerId).toBe("usr_priya");
    expect(household.members.length).toBe(1);

    const owner = household.members[0];
    expect(owner.userId).toBe("usr_priya");
    expect(owner.phone).toBe("+919876543210");
    expect(owner.role).toBe("PRIMARY_OWNER");
    expect(owner.canManageSubscriptions).toBe(true);
    expect(owner.canSkipDeliveries).toBe(true);
  });

  it("invites a flatmate, normalizes E.164 phone, and grants delegated skip permissions", () => {
    const household = HouseholdService.createHousehold({
      name: "Purva A-101 Bachelors",
      primaryOwnerId: "usr_rahul",
      ownerName: "Rahul Verma",
      ownerPhone: "9876543211",
      societyName: "Purva Fairmont",
      towerWing: "Tower A",
      floor: "1",
      flatNumber: "A-101",
    });

    const { member: roommate } = HouseholdService.inviteMember({
      householdId: household.id,
      invitedByUserId: "usr_rahul",
      name: "Siddharth Joshi",
      phone: "98765 43212", // unformatted Indian phone
      role: "MEMBER",
      canSkipDeliveries: true,
      canManageSubscriptions: false,
    });

    expect(roommate.name).toBe("Siddharth Joshi");
    expect(roommate.phone).toBe("+919876543212");
    expect(roommate.role).toBe("MEMBER");
    expect(roommate.canSkipDeliveries).toBe(true);
    expect(roommate.canManageSubscriptions).toBe(false);

    // Permission check: Roommate CAN skip delivery
    const canSkip = HouseholdService.canPerformAction(
      household.id,
      roommate.userId,
      "SKIP_DELIVERY"
    );
    expect(canSkip).toBe(true);

    // Permission check: Roommate CANNOT alter primary billing subscription
    const canManageSub = HouseholdService.canPerformAction(
      household.id,
      roommate.userId,
      "MANAGE_SUBSCRIPTIONS"
    );
    expect(canManageSub).toBe(false);
  });

  it("prevents non-admins from inviting members and rejects duplicate phone numbers", () => {
    const household = HouseholdService.createHousehold({
      name: "Palm Meadows Villa 22",
      primaryOwnerId: "usr_karan",
      ownerName: "Karan Johar",
      ownerPhone: "9876543213",
      societyName: "Palm Meadows",
      towerWing: "Villa",
      floor: "Ground",
      flatNumber: "Villa 22",
    });

    const { member: guest } = HouseholdService.inviteMember({
      householdId: household.id,
      invitedByUserId: "usr_karan",
      name: "Rohan",
      phone: "9876543214",
      role: "GUEST",
    });

    // Guest tries to invite another person -> throws
    expect(() =>
      HouseholdService.inviteMember({
        householdId: household.id,
        invitedByUserId: guest.userId,
        name: "Intruder",
        phone: "9876543215",
      })
    ).toThrow("Only household owners or admins can invite new members");

    // Owner tries to invite same phone -> throws duplicate
    expect(() =>
      HouseholdService.inviteMember({
        householdId: household.id,
        invitedByUserId: "usr_karan",
        name: "Rohan Duplicate",
        phone: "9876543214",
      })
    ).toThrow("already belongs to this household");
  });

  it("prevents removing the primary owner while allowing owner to remove members", () => {
    const household = HouseholdService.createHousehold({
      name: "Adarsh Rhythm 302",
      primaryOwnerId: "usr_anand",
      ownerName: "Anand",
      ownerPhone: "9876543222",
      societyName: "Adarsh Rhythm",
      towerWing: "Tower 1",
      floor: "3",
      flatNumber: "302",
    });

    const { member: tenant } = HouseholdService.inviteMember({
      householdId: household.id,
      invitedByUserId: "usr_anand",
      name: "Tenant Exiting",
      phone: "9876543223",
      role: "MEMBER",
    });

    // Attempting to remove primary owner throws
    expect(() =>
      HouseholdService.removeMember(household.id, "usr_anand", "usr_anand")
    ).toThrow("Cannot remove primary owner from household");

    // Primary owner successfully removes member
    const updated = HouseholdService.removeMember(household.id, tenant.userId, "usr_anand");
    expect(updated.members.length).toBe(1);
    expect(updated.members[0].userId).toBe("usr_anand");
  });
});
