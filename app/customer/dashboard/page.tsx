import type { Metadata } from "next";
import CustomerDashboardClient from "./CustomerDashboardClient";

export const metadata: Metadata = {
  title: "Household Operations Portal | RUXS",
  description:
    "Manage daily tiffin and water deliveries, 1-tap WhatsApp cutoff skips, transparent Digital Khata statements, and instant UPI settlements.",
  alternates: {
    canonical: "https://ruxs.in/customer/dashboard",
  },
  openGraph: {
    title: "Household Operations Portal — RUXS",
    description: "Autopilot fulfillment, 10:00 AM cutoff skip controls, and zero-argument digital Khata ledger.",
    url: "https://ruxs.in/customer/dashboard",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Household Operations Portal — RUXS",
    description: "Daily domestic recurring services, digital Khata ledger, and instant UPI payments.",
  },
};

export default function CustomerDashboardPage() {
  return <CustomerDashboardClient />;
}
