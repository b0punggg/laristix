import type { Metadata } from "next";
import { PublicAboutPage } from "@/components/features/public/public-about-page";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Pelajari lebih lanjut tentang Laristix — platform tiket event terpercaya di Indonesia untuk peserta dan organizer.",
};

export default function TentangKamiPage() {
  return <PublicAboutPage />;
}
