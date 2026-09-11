import type { Metadata } from "next";
import HouseholdClient from "./HouseholdClient";

export const metadata: Metadata = {
  title: "Household & Flatmate Management | RUXS",
  description:
    "Manage shared household accounts for apartments. Invite flatmates, delegate 1-tap WhatsApp cutoff skips, and track shared domestic essentials.",
  alternates: {
    canonical: "https://ruxs.in/household",
  },
  openGraph: {
    title: "Household Accounts & Flatmate Coordination — RUXS",
    description: "Shared domestic accounts for flats. One billing owner, delegated delivery skips for all roommates.",
    url: "https://ruxs.in/household",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Household Coordination — RUXS",
    description: "Manage flatmates and delegated delivery skips with zero billing confusion.",
  },
};

export default function HouseholdPage() {
  return <HouseholdClient />;
}
