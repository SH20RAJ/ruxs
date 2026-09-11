import type { Metadata } from "next";
import SubscribeClient from "./SubscribeClient";

export const metadata: Metadata = {
  title: "Subscribe to Recurring Services | RUXS — Everyday Life on Autopilot",
  description:
    "Choose your recurring household services: tiffin meals, 20L water cans, fresh cow milk, and more. Set daily, weekday, or alternate-day delivery cadences with one tap.",
  alternates: {
    canonical: "https://ruxs.in/subscribe",
  },
  openGraph: {
    title: "Subscribe to Recurring Services | RUXS",
    description: "Automate daily domestic deliveries with flexible cadences, pause for vacations, and digital Khata.",
    url: "https://ruxs.in/subscribe",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Subscribe to Recurring Services | RUXS",
    description: "Daily tiffin, water jars, and milk subscriptions on autopilot.",
  },
};

export default function SubscribePage() {
  return <SubscribeClient />;
}
