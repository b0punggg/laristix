import type { Metadata } from "next";
import { PublicCreateEventPage } from "@/components/features/public/public-create-event-page";

export const metadata: Metadata = {
  title: "Buat Event",
  description:
    "Buat dan kelola event kamu sendiri secara online dan gratis di Laristix. Jual tiket, terima pembayaran, dan kelola check-in dalam satu platform.",
};

export default function BuatEventPage() {
  return <PublicCreateEventPage />;
}
