import { z } from "zod";
import { normalizeIndianPhone } from "../../shared/auth/phone";

export const HouseholdRoleSchema = z.enum([
  "PRIMARY_OWNER",
  "ADMIN",
  "MEMBER",
  "GUEST",
]);

export type HouseholdRole = z.infer<typeof HouseholdRoleSchema>;

export const HouseholdMemberSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  userId: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string(),
  role: HouseholdRoleSchema.default("MEMBER"),
  canManageSubscriptions: z.boolean().default(false),
  canSkipDeliveries: z.boolean().default(true), // Delegated skip allowed by default
  joinedAt: z.string(),
});

export type HouseholdMember = z.infer<typeof HouseholdMemberSchema>;

export const HouseholdSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Household name required"),
  primaryOwnerId: z.string(),
  societyName: z.string().min(2),
  towerWing: z.string().min(1),
  floor: z.string().min(1),
  flatNumber: z.string().min(1),
  city: z.string().default("Bengaluru"),
  members: z.array(HouseholdMemberSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Household = z.infer<typeof HouseholdSchema>;

export const CreateHouseholdSchema = z.object({
  name: z.string().min(2),
  primaryOwnerId: z.string(),
  ownerName: z.string().min(2),
  ownerPhone: z.string().transform((val) => normalizeIndianPhone(val)),
  societyName: z.string().min(2),
  towerWing: z.string().min(1),
  floor: z.string().min(1),
  flatNumber: z.string().min(1),
  city: z.string().default("Bengaluru"),
});

export type CreateHouseholdInput = z.infer<typeof CreateHouseholdSchema>;

export const InviteMemberSchema = z.object({
  householdId: z.string(),
  invitedByUserId: z.string(),
  name: z.string().min(2),
  phone: z.string().transform((val) => normalizeIndianPhone(val)),
  role: HouseholdRoleSchema.default("MEMBER"),
  canManageSubscriptions: z.boolean().optional().default(false),
  canSkipDeliveries: z.boolean().optional().default(true),
});

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
