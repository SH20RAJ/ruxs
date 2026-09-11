import type { Metadata } from "next";
import DeliveryClient from "./DeliveryClient";

export const metadata: Metadata = {
  title: "Driver Delivery Run Sheet | RUXS",
  description:
    "Mobile-first, 1-tap delivery run sheet for apartment towers. Sequenced by society, tower, and elevator floor descending with instant doorstep container returns.",
  alternates: {
    canonical: "https://ruxs.in/delivery",
  },
  openGraph: {
    title: "Driver Delivery Operations — RUXS",
    description: "Tower-sequenced delivery run sheets, 1-tap completion, and doorstep returnable container exchange.",
    url: "https://ruxs.in/delivery",
    siteName: "RUXS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Delivery Operations — RUXS",
    description: "Fast mobile driver run sheets and elevator-sequenced deliveries.",
  },
};

export default function DeliveryPage() {
  return <DeliveryClient />;
}
