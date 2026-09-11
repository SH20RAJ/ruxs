import type { Metadata } from "next";
import VendorServicesClient from "./VendorServicesClient";

export const metadata: Metadata = {
  title: "Service Catalog & Pricing | Vendor Command Center | RUXS",
  description:
    "Configure hyper-local recurring services, pricing in integer paise, strict morning cutoff deadlines, and returnable container asset deposits.",
  alternates: {
    canonical: "https://ruxs.in/vendor/services",
  },
  openGraph: {
    title: "Service Catalog & Pricing — RUXS Vendor Hub",
    description:
      "Manage meal plans, water cans, dairy subscriptions, cutoffs, and delivery schedules.",
    url: "https://ruxs.in/vendor/services",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Service Catalog & Pricing — RUXS",
    description: "Manage hyper-local recurring services, cutoff schedules, and container deposits.",
  },
};

export default function VendorServicesPage() {
  return <VendorServicesClient />;
}
