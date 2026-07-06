import { Skeleton } from "@/components/ui/skeleton";

export function StorefrontHeroSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="overflow-hidden rounded-2xl bg-muted/40 p-6 md:p-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-10 w-full max-w-sm" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-32" />
              <Skeleton className="h-11 w-32" />
            </div>
          </div>
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
        </div>
      </div>
    </section>
  );
}
