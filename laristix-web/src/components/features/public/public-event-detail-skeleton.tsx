import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/design-system/primitives/layout";

export function PublicEventDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <Skeleton className="h-64 w-full rounded-none sm:h-72 lg:h-80" />
      <div className="border-b border-border/80 bg-background">
        <div className="mx-auto flex max-w-container gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-36" />
        </div>
      </div>
      <Container className="py-8 md:py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
          <div className="space-y-10">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
            <Skeleton className="h-56 rounded-2xl" />
          </div>
          <div className="relative hidden lg:block">
            <Skeleton className="-mt-[21.5rem] h-[28rem] rounded-2xl" />
          </div>
        </div>
      </Container>
    </div>
  );
}
