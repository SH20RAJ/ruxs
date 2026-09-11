import type { Metadata } from "next";
import VendorOnboardClient from "./VendorOnboardClient";

export const metadata: Metadata = {
  title: "Vendor Onboarding | RUXS — Autopilot for Recurring Businesses",
  description:
    "Onboard your local recurring delivery business on RUXS. Automated daily kitchen prep, WhatsApp cutoff polling, digital Khata, and zero-commission UPI payouts.",
  alternates: {
    canonical: "https://ruxs.in/vendor/onboard",
  },
  openGraph: {
    title: "Vendor Onboarding | RUXS SaaS Infrastructure",
    description: "Empower your local recurring service with modern operational software.",
    url: "https://ruxs.in/vendor/onboard",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vendor Onboarding | RUXS",
    description: "Software infrastructure for India's local recurring delivery vendors.",
  },
};

export default function VendorOnboardPage() {
  return <VendorOnboardClient />;
}
