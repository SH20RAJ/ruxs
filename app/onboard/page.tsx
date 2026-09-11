import type { Metadata } from "next";
import OnboardClient from "./OnboardClient";

export const metadata: Metadata = {
  title: "Household Onboarding | RUXS — Everyday Life on Autopilot",
  description:
    "Register your domestic address and delivery preferences on RUXS. Seamlessly configure tiffin, 20L water, milk, and local subscriptions with one-tap digital Khata.",
  alternates: {
    canonical: "https://ruxs.in/onboard",
  },
  openGraph: {
    title: "Household Onboarding | RUXS",
    description: "Register your domestic address and setup automated recurring doorstep services.",
    url: "https://ruxs.in/onboard",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Household Onboarding | RUXS",
    description: "Configure apartment hierarchy and doorstep drop preferences on RUXS.",
  },
};

export default function CustomerOnboardPage() {
  return <OnboardClient />;
}
