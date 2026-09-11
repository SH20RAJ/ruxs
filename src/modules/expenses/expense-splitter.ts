import {
  HouseholdExpense,
  ExpenseParticipant,
  CreateExpenseInput,
  CreateExpenseInputSchema,
  HouseholdExpenseSchema,
} from "./expense-schema";
import { Paise } from "../../shared/types/money";
import { db, isTestEnv } from "../../shared/db";
import {
  householdExpenses as householdExpensesTable,
  householdExpenseParticipants as householdExpenseParticipantsTable,
} from "../../shared/db/schema";
import { eq, and } from "drizzle-orm";

const expensesStore = new Map<string, HouseholdExpense>();

export class ExpenseSplitter {
  /**
   * Splits a household domestic invoice among flatmates with zero-drift integer Paise arithmetic
   */
  static createExpense(rawInput: unknown): HouseholdExpense {
    const input: CreateExpenseInput = CreateExpenseInputSchema.parse(rawInput);
    const n = input.participants.length;
    const totalPaise = input.totalAmountPaise;

    let computedParticipants: ExpenseParticipant[] = [];

    if (input.strategy === "EQUAL") {
      const baseShare = Math.floor(totalPaise / n);
      const remainder = totalPaise % n;

      computedParticipants = input.participants.map((p, idx) => {
        // Distribute remainder paise one by one to ensure exact sum match
        const allocatedPaise = idx < remainder ? baseShare + 1 : baseShare;
        const isPayer = p.userId === input.paidByUserId;

        return {
          userId: p.userId,
          name: p.name,
          phone: p.phone,
          sharePaise: allocatedPaise,
          isSettled: isPayer, // Payer already covered their own share
          settledAt: isPayer ? new Date().toISOString() : undefined,
          upiId: p.upiId,
        };
      });
    } else if (input.strategy === "PERCENTAGE") {
      const totalPct = input.participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
      if (Math.round(totalPct) !== 100) {
        throw new Error(`Participant percentages must sum to 100% (currently ${totalPct}%)`);
      }

      let distributed = 0;
      computedParticipants = input.participants.map((p) => {
        const share = Math.floor((totalPaise * (p.percentage || 0)) / 100);
        distributed += share;
        const isPayer = p.userId === input.paidByUserId;

        return {
          userId: p.userId,
          name: p.name,
          phone: p.phone,
          sharePaise: share,
          isSettled: isPayer,
          settledAt: isPayer ? new Date().toISOString() : undefined,
          upiId: p.upiId,
        };
      });

      // Allocate rounding remainder to the first participant
      const diff = totalPaise - distributed;
      if (diff > 0 && computedParticipants.length > 0) {
        computedParticipants[0].sharePaise += diff;
      }
    } else if (input.strategy === "CUSTOM_PAISE") {
      const sumCustom = input.participants.reduce((sum, p) => sum + (p.customPaise || 0), 0);
      if (sumCustom !== totalPaise) {
        throw new Error(
          `Custom shares sum (₹${sumCustom / 100}) does not match total expense amount (₹${
            totalPaise / 100
          })`
        );
      }

      computedParticipants = input.participants.map((p) => {
        const isPayer = p.userId === input.paidByUserId;
        return {
          userId: p.userId,
          name: p.name,
          phone: p.phone,
          sharePaise: p.customPaise || 0,
          isSettled: isPayer,
          settledAt: isPayer ? new Date().toISOString() : undefined,
          upiId: p.upiId,
        };
      });
    }

    // Invariant verification: sum of participant shares MUST equal total expense exactly
    const sumOfShares = computedParticipants.reduce((sum, p) => sum + p.sharePaise, 0);
    if (sumOfShares !== totalPaise) {
      throw new Error(`Integrity error: sum of shares ${sumOfShares} != total ${totalPaise}`);
    }

    const allSettled = computedParticipants.every((p) => p.isSettled);

    const expenseId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const expense: HouseholdExpense = HouseholdExpenseSchema.parse({
      id: expenseId,
      householdId: input.householdId,
      invoiceId: input.invoiceId,
      description: input.description,
      totalAmountPaise: totalPaise,
      paidByUserId: input.paidByUserId,
      paidByName: input.paidByName,
      paidByUpi: input.paidByUpi,
      strategy: input.strategy,
      participants: computedParticipants,
      isFullySettled: allSettled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expensesStore.set(expenseId, expense);

    if (!isTestEnv) {
      db.insert(householdExpensesTable)
        .values({
          id: expenseId,
          householdId: input.householdId,
          invoiceId: input.invoiceId,
          description: input.description,
          totalAmountPaise: totalPaise,
          paidByUserId: input.paidByUserId,
          paidByName: input.paidByName,
          paidByUpi: input.paidByUpi,
          strategy: input.strategy,
          isFullySettled: allSettled,
        })
        .catch(() => {});

      for (const p of computedParticipants) {
        db.insert(householdExpenseParticipantsTable)
          .values({
            id: `part_${expenseId}_${p.userId}`,
            expenseId,
            userId: p.userId,
            name: p.name,
            phone: p.phone,
            sharePaise: p.sharePaise,
            isSettled: p.isSettled,
            upiId: p.upiId,
          })
          .catch(() => {});
      }
    }

    return expense;
  }

  /**
   * Generates an NPCI-compliant UPI Intent deep link for P2P roommate debt settlement
   */
  static generateP2PUpiLink(params: {
    payeeUpi: string;
    payeeName: string;
    amountPaise: number;
    note?: string;
  }): string {
    const rupees = (params.amountPaise / 100).toFixed(2);
    const encName = encodeURIComponent(params.payeeName);
    const encNote = encodeURIComponent(params.note || "RUXS Splitwise Settlement");

    return `upi://pay?pa=${params.payeeUpi}&pn=${encName}&am=${rupees}&cu=INR&tn=${encNote}`;
  }

  /**
   * Marks a roommate's debt as settled
   */
  static settleParticipantDebt(
    expenseId: string,
    participantUserId: string
  ): HouseholdExpense {
    const expense = expensesStore.get(expenseId);
    if (!expense) {
      throw new Error(`Expense ${expenseId} not found`);
    }

    const participant = expense.participants.find((p) => p.userId === participantUserId);
    if (!participant) {
      throw new Error(`Participant ${participantUserId} not in expense ${expenseId}`);
    }

    participant.isSettled = true;
    participant.settledAt = new Date().toISOString();

    expense.isFullySettled = expense.participants.every((p) => p.isSettled);
    expense.updatedAt = new Date().toISOString();
    expensesStore.set(expense.id, expense);

    if (!isTestEnv) {
      db.update(householdExpenseParticipantsTable)
        .set({
          isSettled: true,
          settledAt: new Date(),
        })
        .where(
          and(
            eq(householdExpenseParticipantsTable.expenseId, expenseId),
            eq(householdExpenseParticipantsTable.userId, participantUserId)
          )
        )
        .catch(() => {});

      db.update(householdExpensesTable)
        .set({
          isFullySettled: expense.isFullySettled,
          updatedAt: new Date(),
        })
        .where(eq(householdExpensesTable.id, expenseId))
        .catch(() => {});
    }

    return expense;
  }

  /**
   * Lists all expenses for a household
   */
  static listByHousehold(householdId: string): HouseholdExpense[] {
    return Array.from(expensesStore.values()).filter((e) => e.householdId === householdId);
  }

  /**
   * Lists all expenses for a household from Neon DB
   */
  static async listByHouseholdAsync(householdId: string): Promise<HouseholdExpense[]> {
    if (!isTestEnv) {
      try {
        const expRows = await db
          .select()
          .from(householdExpensesTable)
          .where(eq(householdExpensesTable.householdId, householdId));

        if (expRows && expRows.length > 0) {
          const result: HouseholdExpense[] = [];
          for (const exp of expRows) {
            const partRows = await db
              .select()
              .from(householdExpenseParticipantsTable)
              .where(eq(householdExpenseParticipantsTable.expenseId, exp.id));

            result.push({
              id: exp.id,
              householdId: exp.householdId,
              invoiceId: exp.invoiceId ?? undefined,
              description: exp.description,
              totalAmountPaise: exp.totalAmountPaise,
              paidByUserId: exp.paidByUserId,
              paidByName: exp.paidByName,
              paidByUpi: exp.paidByUpi,
              strategy: exp.strategy as any,
              participants: partRows.map((p) => ({
                userId: p.userId,
                name: p.name,
                phone: p.phone,
                sharePaise: p.sharePaise,
                isSettled: p.isSettled,
                settledAt: p.settledAt ? p.settledAt.toISOString() : undefined,
                upiId: p.upiId ?? undefined,
              })),
              isFullySettled: exp.isFullySettled,
              createdAt: exp.createdAt.toISOString(),
              updatedAt: exp.updatedAt.toISOString(),
            });
          }
          return result;
        }
      } catch {
        // Fallback
      }
    }
    return this.listByHousehold(householdId);
  }

  /**
   * Calculates net debt balances for a user in a household
   */
  static calculateUserNetBalance(
    householdId: string,
    userId: string
  ): {
    totalOwedToUserPaise: number;
    totalUserOwesPaise: number;
  } {
    const householdExpenses = this.listByHousehold(householdId);
    let totalOwedToUserPaise = 0;
    let totalUserOwesPaise = 0;

    for (const exp of householdExpenses) {
      if (exp.paidByUserId === userId) {
        // User paid: others owe user
        for (const p of exp.participants) {
          if (p.userId !== userId && !p.isSettled) {
            totalOwedToUserPaise += p.sharePaise;
          }
        }
      } else {
        // Someone else paid: check if current user has an unsettled share
        const myShare = exp.participants.find((p) => p.userId === userId);
        if (myShare && !myShare.isSettled) {
          totalUserOwesPaise += myShare.sharePaise;
        }
      }
    }

    return { totalOwedToUserPaise, totalUserOwesPaise };
  }
}
