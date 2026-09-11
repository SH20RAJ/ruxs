import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Platform Admin Console | RUXS",
  description:
    "Global operational oversight, local vendor verification, SaaS subscription tier management, and tamper-evident platform audit logs.",
  alternates: {
    canonical: "https://ruxs.in/admin",
  },
  openGraph: {
    title: "Global Platform Oversight — RUXS Admin Console",
    description: "Vendor verification, plan tier allocation, and immutable audit logging for hyper-local operations.",
    url: "https://ruxs.in/admin",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Platform Admin Console — RUXS",
    description: "Global operational oversight and immutable audit logs.",
  },
};

export default function AdminPage() {
  return <AdminClient />;
}
