import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In | RUXS — Everyday Life on Autopilot",
  description:
    "Secure, passwordless mobile sign in to your RUXS domestic command center. Coordinate your household recurring services, subscriptions, and digital Khata.",
  alternates: {
    canonical: "https://ruxs.in/login",
  },
  openGraph: {
    title: "Sign In to RUXS — Everyday Life on Autopilot",
    description: "Access your daily domestic recurring services, digital Khata, and subscriptions.",
    url: "https://ruxs.in/login",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sign In to RUXS",
    description: "Passwordless OTP login for customers, vendors, and delivery staff.",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
