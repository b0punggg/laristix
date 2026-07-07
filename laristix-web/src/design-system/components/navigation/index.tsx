import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/primitives/text";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: React.ReactNode;
}

interface SidebarProps {
  logo?: React.ReactNode;
  items: NavItem[];
  footer?: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({ logo, items, footer, collapsed = false, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card",
        collapsed ? "w-[72px]" : "w-64",
        className,
      )}
      aria-label="Sidebar navigasi"
    >
      {logo ? <div className={cn("flex h-16 items-center border-b px-4", collapsed && "justify-center px-2")}>{logo}</div> : null}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "ds-focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              item.active
                ? "bg-brand-muted text-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
            aria-current={item.active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed ? (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge}
              </>
            ) : null}
          </Link>
        ))}
      </nav>
      {footer ? <div className={cn("border-t p-3", collapsed && "px-2")}>{footer}</div> : null}
    </aside>
  );
}

interface TopNavProps {
  brand?: React.ReactNode;
  start?: React.ReactNode;
  end?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function TopNav({ brand, start, end, className, sticky = true }: TopNavProps) {
  return (
    <header
      className={cn(
        "z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div className="ds-container flex h-16 items-center gap-4">
        {brand}
        {start ? <div className="flex flex-1 items-center gap-3">{start}</div> : <div className="flex-1" />}
        {end ? <div className="flex items-center gap-2">{end}</div> : null}
      </div>
    </header>
  );
}

interface FooterProps {
  brand?: React.ReactNode;
  links?: Array<{ label: string; href: string }>;
  copyright?: string;
  className?: string;
}

export function DsFooter({ brand, links, copyright, className }: FooterProps) {
  return (
    <footer className={cn("border-t bg-surface", className)}>
      <div className="ds-container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>{brand}</div>
        {links?.length ? (
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
      {copyright ? (
        <div className="border-t py-4">
          <Text variant="caption" className="ds-container block text-center">
            {copyright}
          </Text>
        </div>
      ) : null}
    </footer>
  );
}

export { UserMenu } from "./user-menu";
export type { UserMenuItem } from "./user-menu";
export { NotificationMenu } from "./notification-menu";
