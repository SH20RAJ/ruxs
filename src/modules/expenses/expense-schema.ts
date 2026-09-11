import { z } from "zod";
import { Paise } from "../../shared/types/money";

export const SplitStrategySchema = z.enum([
  "EQUAL",
  "PERCENTAGE",
  "CUSTOM_PAISE",
]);

export type SplitStrategy = z.infer<typeof SplitStrategySchema>;

export const ExpenseParticipantSchema = z.object({
  userId: z.string(),
  name: z.string(),
  phone: z.string(),
  sharePaise: z.number().int().nonnegative(), // in integer Paise
  isSettled: z.boolean().default(false),
  settledAt: z.string().optional(),
  upiId: z.string().optional(),
});

export type ExpenseParticipant = z.infer<typeof ExpenseParticipantSchema>;

export const HouseholdExpenseSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  invoiceId: z.string().optional(),
  description: z.string().min(2),
  totalAmountPaise: z.number().int().positive(),
  paidByUserId: z.string(),
  paidByName: z.string(),
  paidByUpi: z.string(),
  strategy: SplitStrategySchema.default("EQUAL"),
  participants: z.array(ExpenseParticipantSchema),
  isFullySettled: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type HouseholdExpense = z.infer<typeof HouseholdExpenseSchema>;

export const CreateExpenseInputSchema = z.object({
  householdId: z.string(),
  invoiceId: z.string().optional(),
  description: z.string().min(2),
  totalAmountPaise: z.number().int().positive(),
  paidByUserId: z.string(),
  paidByName: z.string(),
  paidByUpi: z.string(),
  strategy: SplitStrategySchema.default("EQUAL"),
  participants: z.array(
    z.object({
      userId: z.string(),
      name: z.string(),
      phone: z.string(),
      percentage: z.number().min(0).max(100).optional(),
      customPaise: z.number().int().nonnegative().optional(),
      upiId: z.string().optional(),
    })
  ).min(1, "At least 1 participant required"),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseInputSchema>;
