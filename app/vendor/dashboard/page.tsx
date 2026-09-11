import type { Metadata } from "next";
import VendorDashboardClient from "./VendorDashboardClient";

export const metadata: Metadata = {
  title: "Kitchen Prep & Delivery Counter | Vendor Hub | RUXS",
  description:
    "Real-time kitchen production batches, cutoff locking engine, subscriber roster, and Digital Khata balances for recurring service vendors.",
  alternates: {
    canonical: "https://ruxs.in/vendor/dashboard",
  },
  openGraph: {
    title: "Vendor Kitchen Prep Counter — RUXS",
    description: "Live kitchen batch aggregation, strict 10:00 AM cutoff locking, and driver run sheet coordination.",
    url: "https://ruxs.in/vendor/dashboard",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vendor Command Center — RUXS",
    description: "Real-time kitchen prep counter and automated cutoff engine.",
  },
};

export default function VendorDashboardPage() {
  return <VendorDashboardClient />;
}
