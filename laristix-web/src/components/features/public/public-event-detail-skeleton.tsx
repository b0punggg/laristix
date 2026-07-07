import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/design-system/primitives/layout";

export function PublicEventDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <Skeleton className="aspect-[16/9] w-full rounded-none sm:aspect-[21/9]" />
      <Container className="py-8 md:py-10">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-10 xl:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full max-w-2xl" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl" />
            </div>
          </div>
          <Skeleton className="hidden h-80 rounded-2xl lg:block" />
        </div>
      </Container>
    </div>
  );
}
