import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicHomeContent } from "@/components/features/public/public-home-content";
import { PublicEventGridSkeleton } from "@/components/features/public/public-event-card-skeleton";
import { env } from "@/config/env";

export const metadata: Metadata = {
  title: "Laristix — Temukan & Beli Tiket Event",
  description:
    "Jelajahi konser, festival, workshop, dan ribuan acara menarik di Indonesia. Beli tiket online dengan aman melalui Midtrans.",
  openGraph: {
    title: "Laristix — Temukan & Beli Tiket Event",
    description:
      "Jelajahi konser, festival, workshop, dan ribuan acara menarik. Beli tiket online dengan aman.",
    type: "website",
    url: env.appUrl,
    siteName: "Laristix",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Laristix — Temukan & Beli Tiket Event",
    description:
      "Jelajahi konser, festival, workshop, dan ribuan acara menarik. Beli tiket online dengan aman.",
  },
};

function HomeContentFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 pb-10">
      <PublicEventGridSkeleton count={4} />
    </div>
  );
}

export default function PublicHomePage() {
  return (
    <Suspense fallback={<HomeContentFallback />}>
      <PublicHomeContent />
    </Suspense>
  );
}
