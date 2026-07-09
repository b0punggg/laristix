import type { Metadata } from "next";
import { PublicTermsPage } from "@/components/features/public/public-terms-page";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan platform Laristix untuk pembelian tiket event dan layanan organizer.",
};

export default function SyaratKetentuanPage() {
  return <PublicTermsPage />;
}
