import type { Metadata } from "next";
import { PublicFaqPage } from "@/components/features/public/public-faq-page";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Pertanyaan yang sering diajukan tentang pembelian tiket, organizer, dan layanan Laristix.",
};

export default function FaqPage() {
  return <PublicFaqPage />;
}
