import type { Metadata } from "next";
import DisputesClient from "./DisputesClient";

export const metadata: Metadata = {
  title: "Dispute & Claim Management | RUXS",
  description:
    "Arbitrate missing meals, damaged packaging, and late deliveries with evidence timelines and automated compensating Digital Khata ledger refunds.",
  alternates: {
    canonical: "https://ruxs.in/disputes",
  },
  openGraph: {
    title: "Dispute & Claim Management — RUXS",
    description: "Evidence-backed arbitration and automated compensating Khata refunds for hyper-local deliveries.",
    url: "https://ruxs.in/disputes",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dispute Management — RUXS",
    description: "Automated delivery dispute arbitration and compensating refunds.",
  },
};

export default function DisputesPage() {
  return <DisputesClient />;
}
