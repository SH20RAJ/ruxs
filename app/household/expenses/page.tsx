import type { Metadata } from "next";
import HouseholdExpensesClient from "./HouseholdExpensesClient";

export const metadata: Metadata = {
  title: "Roommate Expense Splitting | RUXS",
  description:
    "Automated expense splitting for flatmates sharing recurring milk, water, and domestic bills with zero penny drift and instant P2P UPI settlements.",
  alternates: {
    canonical: "https://ruxs.in/household/expenses",
  },
  openGraph: {
    title: "Roommate Expense Splitting — RUXS",
    description: "Integer paise expense division and instant peer-to-peer UPI settlements between flatmates.",
    url: "https://ruxs.in/household/expenses",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Household Expense Splitting — RUXS",
    description: "Automatic bill splitting and peer-to-peer UPI settlements.",
  },
};

export default function RoommateExpensesPage() {
  return <HouseholdExpensesClient />;
}
