import { Suspense } from "react";
import { StorefrontBanners } from "@/components/layouts/storefront/storefront-banners";
import { PublicEventList } from "@/components/features/public/public-event-list";

function EventListFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
      <p className="text-muted-foreground">Memuat event...</p>
    </div>
  );
}

export default function PublicHomePage() {
  return (
    <>
      <StorefrontBanners />
      <Suspense fallback={<EventListFallback />}>
        <PublicEventList hideSearch />
      </Suspense>
    </>
  );
}
