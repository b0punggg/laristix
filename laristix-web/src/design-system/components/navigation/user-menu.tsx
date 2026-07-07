"use client";

import * as React from "react";
import { LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/design-system/primitives/text";

export interface UserMenuItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}

interface UserMenuProps {
  name: string;
  email?: string;
  avatarUrl?: string | null;
  items?: UserMenuItem[];
  onLogout?: () => void;
  className?: string;
}

export function UserMenu({ name, email, avatarUrl, items = [], onLogout, className }: UserMenuProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn("ds-focus-ring flex items-center gap-2 rounded-full", className)}
          aria-label="Menu pengguna"
        >
          <Avatar className="size-9">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <Text variant="body-md" className="font-medium">
            {name}
          </Text>
          {email ? <Text variant="caption">{email}</Text> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.label} onClick={item.onClick} className={item.destructive ? "text-danger" : ""}>
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem>
          <User className="size-4" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4" />
          Pengaturan
        </DropdownMenuItem>
        {onLogout ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-danger">
              <LogOut className="size-4" />
              Keluar
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
