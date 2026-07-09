import type { Metadata } from "next";
import { PublicPricingPage } from "@/components/features/public/public-pricing-page";

export const metadata: Metadata = {
  title: "Biaya",
  description:
    "Informasi biaya promosi event, admin fee tiket, dan fitur platform Laristix untuk organizer.",
};

export default function BiayaPage() {
  return <PublicPricingPage />;
}
