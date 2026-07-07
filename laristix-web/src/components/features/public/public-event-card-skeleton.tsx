import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PublicEventCardSkeleton() {
  return (
    <Card padding="none" className="overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between border-t pt-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicEventGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <PublicEventCardSkeleton key={index} />
      ))}
    </div>
  );
}
