"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Text } from "@/design-system/primitives/text";

interface NotificationMenuProps {
  count?: number;
  children?: React.ReactNode;
  className?: string;
  label?: string;
}

export function NotificationMenu({
  count = 0,
  children,
  className,
  label = "Notifikasi",
}: NotificationMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton variant="ghost" size="sm" className={cn("relative", className)} label={label}>
          <Bell className="size-5" />
          {count > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-foreground">
              {count > 9 ? "9+" : count}
            </span>
          ) : null}
        </IconButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <Text variant="h4">{label}</Text>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
