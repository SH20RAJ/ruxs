import {
  Household,
  HouseholdMember,
  CreateHouseholdInput,
  CreateHouseholdSchema,
  InviteMemberInput,
  InviteMemberSchema,
} from "./household-schema";
import { db, isTestEnv } from "../../shared/db";
import {
  households as householdsTable,
  householdMembers as householdMembersTable,
  users as usersTable,
} from "../../shared/db/schema";
import { eq } from "drizzle-orm";

const householdStore = new Map<string, Household>();
const userHouseholdIndex = new Map<string, string>(); // userId -> householdId

export class HouseholdService {
  /**
   * Creates a unified household with the creator as PRIMARY_OWNER
   */
  static createHousehold(rawInput: unknown): Household {
    const input: CreateHouseholdInput = CreateHouseholdSchema.parse(rawInput);
    const householdId = `hh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const ownerMember: HouseholdMember = {
      id: `hm_${Date.now()}_1`,
      householdId,
      userId: input.primaryOwnerId,
      name: input.ownerName,
      phone: input.ownerPhone,
      role: "PRIMARY_OWNER",
      canManageSubscriptions: true,
      canSkipDeliveries: true,
      joinedAt: new Date().toISOString(),
    };

    const household: Household = {
      id: householdId,
      name: input.name,
      primaryOwnerId: input.primaryOwnerId,
      societyName: input.societyName,
      towerWing: input.towerWing,
      floor: input.floor,
      flatNumber: input.flatNumber,
      city: input.city,
      members: [ownerMember],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    householdStore.set(householdId, household);
    userHouseholdIndex.set(input.primaryOwnerId, householdId);

    if (!isTestEnv) {
      db.insert(householdsTable)
        .values({
          id: householdId,
          name: input.name,
          primaryOwnerId: input.primaryOwnerId,
          societyName: input.societyName,
          towerWing: input.towerWing,
          floor: String(input.floor),
          flatNumber: input.flatNumber,
          city: input.city,
        })
        .catch(() => {});

      db.insert(householdMembersTable)
        .values({
          id: ownerMember.id,
          householdId,
          userId: input.primaryOwnerId,
          role: "PRIMARY_OWNER",
        })
        .catch(() => {});
    }

    return household;
  }

  /**
   * Invites a roommate or family member to the household
   */
  static inviteMember(rawInput: unknown): { household: Household; member: HouseholdMember } {
    const input: InviteMemberInput = InviteMemberSchema.parse(rawInput);
    const household = householdStore.get(input.householdId);

    if (!household) {
      throw new Error(`Household ${input.householdId} not found`);
    }

    // Permission check: only PRIMARY_OWNER or ADMIN can invite members
    const inviter = household.members.find((m) => m.userId === input.invitedByUserId);
    if (!inviter || (inviter.role !== "PRIMARY_OWNER" && inviter.role !== "ADMIN")) {
      throw new Error("Only household owners or admins can invite new members");
    }

    // Duplicate check
    const existing = household.members.find((m) => m.phone === input.phone);
    if (existing) {
      throw new Error(`A member with phone ${input.phone} already belongs to this household`);
    }

    const memberUserId = `usr_${Math.random().toString(36).substring(2, 9)}`;
    const newMember: HouseholdMember = {
      id: `hm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      householdId: input.householdId,
      userId: memberUserId,
      name: input.name,
      phone: input.phone,
      role: input.role,
      canManageSubscriptions: !!input.canManageSubscriptions,
      canSkipDeliveries: input.canSkipDeliveries !== undefined ? input.canSkipDeliveries : true,
      joinedAt: new Date().toISOString(),
    };

    household.members.push(newMember);
    household.updatedAt = new Date().toISOString();
    householdStore.set(household.id, household);
    userHouseholdIndex.set(memberUserId, household.id);

    if (!isTestEnv) {
      db.insert(householdMembersTable)
        .values({
          id: newMember.id,
          householdId: input.householdId,
          userId: memberUserId,
          role: input.role,
        })
        .catch(() => {});
    }

    return { household, member: newMember };
  }

  /**
   * Retrieves a household by ID
   */
  static getHousehold(id: string): Household | null {
    return householdStore.get(id) || null;
  }

  /**
   * Retrieves a household by ID from Neon DB
   */
  static async getHouseholdAsync(id: string): Promise<Household | null> {
    if (!isTestEnv) {
      try {
        const [hRow] = await db
          .select()
          .from(householdsTable)
          .where(eq(householdsTable.id, id));

        if (hRow) {
          const mRows = await db
            .select({
              member: householdMembersTable,
              user: usersTable,
            })
            .from(householdMembersTable)
            .leftJoin(usersTable, eq(householdMembersTable.userId, usersTable.id))
            .where(eq(householdMembersTable.householdId, id));

          return {
            id: hRow.id,
            name: hRow.name,
            primaryOwnerId: hRow.primaryOwnerId,
            societyName: hRow.societyName,
            towerWing: hRow.towerWing,
            floor: String(hRow.floor),
            flatNumber: hRow.flatNumber,
            city: hRow.city,
            createdAt: hRow.createdAt.toISOString(),
            updatedAt: hRow.createdAt.toISOString(),
            members: mRows.map(({ member: m, user: u }) => ({
              id: m.id,
              householdId: m.householdId,
              userId: m.userId,
              name: u?.fullName || "Member",
              phone: u?.phone || "+91 98765 43210",
              role: m.role as any,
              canManageSubscriptions: m.role === "PRIMARY_OWNER" || m.role === "ADMIN",
              canSkipDeliveries: true,
              joinedAt: m.createdAt.toISOString(),
            })),
          };
        }
      } catch {
        // Fallback
      }
    }
    return this.getHousehold(id);
  }

  /**
   * Retrieves household for a specific user
   */
  static getHouseholdForUser(userId: string): Household | null {
    const householdId = userHouseholdIndex.get(userId);
    if (!householdId) return null;
    return householdStore.get(householdId) || null;
  }

  /**
   * Retrieves household for a specific user from Neon DB
   */
  static async getHouseholdForUserAsync(userId: string): Promise<Household | null> {
    if (!isTestEnv) {
      try {
        const [mRow] = await db
          .select()
          .from(householdMembersTable)
          .where(eq(householdMembersTable.userId, userId));

        if (mRow) {
          return this.getHouseholdAsync(mRow.householdId);
        }
      } catch {
        // Fallback
      }
    }
    return this.getHouseholdForUser(userId);
  }

  /**
   * Checks if a member has permission to perform an action (e.g. delegated skip)
   */
  static canPerformAction(
    householdId: string,
    userId: string,
    action: "SKIP_DELIVERY" | "MANAGE_SUBSCRIPTIONS" | "VIEW_SERVICES"
  ): boolean {
    const household = householdStore.get(householdId);
    if (!household) return false;

    const member = household.members.find((m) => m.userId === userId);
    if (!member) return false;

    if (member.role === "PRIMARY_OWNER" || member.role === "ADMIN") {
      return true;
    }

    if (action === "VIEW_SERVICES") {
      return true;
    }

    if (action === "SKIP_DELIVERY") {
      return member.canSkipDeliveries;
    }

    if (action === "MANAGE_SUBSCRIPTIONS") {
      return member.canManageSubscriptions;
    }

    return false;
  }

  /**
   * Removes a member from the household
   */
  static removeMember(
    householdId: string,
    memberUserId: string,
    requestedByUserId: string
  ): Household {
    const household = householdStore.get(householdId);
    if (!household) {
      throw new Error(`Household ${householdId} not found`);
    }

    const requester = household.members.find((m) => m.userId === requestedByUserId);
    if (!requester || (requester.role !== "PRIMARY_OWNER" && requester.role !== "ADMIN")) {
      throw new Error("Only household owners or admins can remove members");
    }

    if (memberUserId === household.primaryOwnerId) {
      throw new Error("Cannot remove primary owner from household");
    }

    const memberIndex = household.members.findIndex((m) => m.userId === memberUserId);
    if (memberIndex === -1) {
      throw new Error(`Member ${memberUserId} not found in household`);
    }

    household.members.splice(memberIndex, 1);
    userHouseholdIndex.delete(memberUserId);
    household.updatedAt = new Date().toISOString();
    householdStore.set(household.id, household);

    return household;
  }
}
