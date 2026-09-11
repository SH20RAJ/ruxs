import { describe, it, expect } from "bun:test";
import { ExpenseSplitter } from "./expense-splitter";

describe("Household Expense Splitting & P2P UPI Settlements", () => {
  it("splits an indivisible invoice amount equally with exact integer Paise allocation and zero lost penny", () => {
    // ₹100.00 = 10,000 Paise split 3 ways (10000 / 3 = 3333 with remainder 1)
    const expense = ExpenseSplitter.createExpense({
      householdId: "hh_sobha_b402",
      description: "September Shared Bisleri Water Jars",
      totalAmountPaise: 10000,
      paidByUserId: "usr_priya",
      paidByName: "Priya Sundaram",
      paidByUpi: "priya@okaxis",
      strategy: "EQUAL",
      participants: [
        { userId: "usr_priya", name: "Priya Sundaram", phone: "+919876543210" },
        { userId: "usr_ananya", name: "Ananya", phone: "+919876543217" },
        { userId: "usr_sneha", name: "Sneha", phone: "+919876543218" },
      ],
    });

    expect(expense.participants.length).toBe(3);

    // Sum of shares MUST equal exactly 10,000 Paise
    const sum = expense.participants.reduce((acc, p) => acc + p.sharePaise, 0);
    expect(sum).toBe(10000);

    // Participant 1 gets 3334, others get 3333
    expect(expense.participants[0].sharePaise).toBe(3334);
    expect(expense.participants[1].sharePaise).toBe(3333);
    expect(expense.participants[2].sharePaise).toBe(3333);

    // Priya is the payer, so her share is auto-settled
    expect(expense.participants[0].isSettled).toBe(true);
    expect(expense.participants[1].isSettled).toBe(false);
    expect(expense.participants[2].isSettled).toBe(false);
    expect(expense.isFullySettled).toBe(false);
  });

  it("splits by percentage and validates 100% total requirement", () => {
    // 50%, 30%, 20% on ₹240.00 (24,000 Paise)
    const expense = ExpenseSplitter.createExpense({
      householdId: "hh_sobha_b402",
      description: "Nandini Milk Monthly Bill",
      totalAmountPaise: 24000,
      paidByUserId: "usr_priya",
      paidByName: "Priya Sundaram",
      paidByUpi: "priya@okaxis",
      strategy: "PERCENTAGE",
      participants: [
        { userId: "usr_priya", name: "Priya", phone: "+919876543210", percentage: 50 },
        { userId: "usr_ananya", name: "Ananya", phone: "+919876543217", percentage: 30 },
        { userId: "usr_sneha", name: "Sneha", phone: "+919876543218", percentage: 20 },
      ],
    });

    expect(expense.participants[0].sharePaise).toBe(12000); // 50% of ₹240
    expect(expense.participants[1].sharePaise).toBe(7200);  // 30% of ₹240
    expect(expense.participants[2].sharePaise).toBe(4800);  // 20% of ₹240

    // Should reject if percentages don't add up to 100%
    expect(() =>
      ExpenseSplitter.createExpense({
        householdId: "hh_sobha_b402",
        description: "Invalid Percentage Bill",
        totalAmountPaise: 10000,
        paidByUserId: "usr_priya",
        paidByName: "Priya",
        paidByUpi: "priya@okaxis",
        strategy: "PERCENTAGE",
        participants: [
          { userId: "usr_priya", name: "Priya", phone: "+919876543210", percentage: 40 },
          { userId: "usr_ananya", name: "Ananya", phone: "+919876543217", percentage: 40 },
        ],
      })
    ).toThrow("percentages must sum to 100%");
  });

  it("generates an NPCI-compliant P2P UPI settlement deep link", () => {
    const upiLink = ExpenseSplitter.generateP2PUpiLink({
      payeeUpi: "priya@okaxis",
      payeeName: "Priya Sundaram",
      amountPaise: 3333, // ₹33.33
      note: "Milk & Water Split B-402",
    });

    expect(upiLink).toContain("upi://pay?");
    expect(upiLink).toContain("pa=priya@okaxis");
    expect(upiLink).toContain("am=33.33");
    expect(upiLink).toContain("cu=INR");
    expect(upiLink).toContain("pn=Priya%20Sundaram");
  });

  it("settles roommate debt and updates household net balances", () => {
    const expense = ExpenseSplitter.createExpense({
      householdId: "hh_settlement_test",
      description: "Drinking Water 20L Cans",
      totalAmountPaise: 6000, // ₹60.00
      paidByUserId: "usr_payer",
      paidByName: "Payer User",
      paidByUpi: "payer@okhdfc",
      strategy: "EQUAL",
      participants: [
        { userId: "usr_payer", name: "Payer", phone: "+919876543210" },
        { userId: "usr_debtor", name: "Debtor", phone: "+919876543211" },
      ],
    });

    // Payer is owed ₹30.00
    const beforeBalance = ExpenseSplitter.calculateUserNetBalance("hh_settlement_test", "usr_payer");
    expect(beforeBalance.totalOwedToUserPaise).toBe(3000);

    // Debtor owes ₹30.00
    const debtorBefore = ExpenseSplitter.calculateUserNetBalance("hh_settlement_test", "usr_debtor");
    expect(debtorBefore.totalUserOwesPaise).toBe(3000);

    // Debtor transfers via UPI and marks settled
    const updatedExpense = ExpenseSplitter.settleParticipantDebt(expense.id, "usr_debtor");
    expect(updatedExpense.isFullySettled).toBe(true);

    // Debt cleared
    const debtorAfter = ExpenseSplitter.calculateUserNetBalance("hh_settlement_test", "usr_debtor");
    expect(debtorAfter.totalUserOwesPaise).toBe(0);
  });
});
