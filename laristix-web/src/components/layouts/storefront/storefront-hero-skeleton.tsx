import { Skeleton } from "@/components/ui/skeleton";

export function StorefrontHeroSkeleton() {
  return (
    <section className="relative w-full overflow-hidden bg-muted">
      <Skeleton className="h-[220px] w-full sm:h-[280px] md:h-[340px] lg:h-[400px]" />
    </section>
  );
}
