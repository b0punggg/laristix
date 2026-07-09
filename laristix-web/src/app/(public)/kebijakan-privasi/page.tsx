import type { Metadata } from "next";
import { PublicPrivacyPage } from "@/components/features/public/public-privacy-page";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi Laristix mengenai pengumpulan, penggunaan, dan perlindungan data pribadi pengguna platform.",
};

export default function KebijakanPrivasiPage() {
  return <PublicPrivacyPage />;
}
