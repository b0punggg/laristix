"use client";

import { SlidersHorizontal } from "lucide-react";
import { PublicEventListingFilters } from "@/components/features/public/public-event-listing-filters";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { usePublicDiscoveryNavigation } from "@/hooks/use-public-discovery-navigation";
import { hasActiveDiscoveryFilters } from "@/lib/public-discovery-filters";

interface PublicEventListingMobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicEventListingMobileDrawer({
  open,
  onOpenChange,
}: PublicEventListingMobileDrawerProps) {
  const { filters, clearFilters } = usePublicDiscoveryNavigation();

  const activeFilterCount = [
    filters.category_id,
    filters.city,
    filters.is_free,
    filters.upcoming_days,
  ].filter(Boolean).length;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="bottom" showClose className="px-0 pb-0">
        <DrawerHeader className="border-b px-4 pb-4 text-left">
          <DrawerTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-brand" aria-hidden />
            Filter Event
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-brand-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </DrawerTitle>
        </DrawerHeader>

        <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
          <PublicEventListingFilters showSort compact />
        </div>

        <DrawerFooter className="flex-row gap-2 border-t bg-card px-4 py-3">
          {hasActiveDiscoveryFilters(filters) ? (
            <Button variant="outline" className="flex-1" onClick={clearFilters}>
              Reset
            </Button>
          ) : null}
          <DrawerClose asChild>
            <Button className="flex-1 bg-brand hover:bg-brand-hover">Terapkan</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface PublicEventListingFilterTriggerProps {
  onClick: () => void;
  activeCount: number;
}

export function PublicEventListingFilterTrigger({
  onClick,
  activeCount,
}: PublicEventListingFilterTriggerProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0 gap-1.5 lg:hidden"
      onClick={onClick}
    >
      <SlidersHorizontal className="size-4" aria-hidden />
      Filter
      {activeCount > 0 ? (
        <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold text-brand-foreground">
          {activeCount}
        </span>
      ) : null}
    </Button>
  );
}
