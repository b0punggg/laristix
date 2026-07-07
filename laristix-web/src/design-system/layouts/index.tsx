import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/design-system/primitives/layout";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerSize?: "default" | "narrow" | "wide";
  withContainer?: boolean;
}

function PageLayout({ children, className, containerSize = "default", withContainer = true }: PageLayoutProps) {
  const content = <main className={cn("min-h-screen", className)}>{children}</main>;
  return withContainer ? <Container size={containerSize}>{content}</Container> : content;
}

export function PublicLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      {children}
    </div>
  );
}

export function DashboardLayout({
  children,
  sidebar,
  topNav,
  className,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  topNav?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-screen bg-surface", className)}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topNav}
        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}

export function AuthLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-screen items-center justify-center bg-surface p-4", className)}>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export function OrganizerLayout(props: React.ComponentProps<typeof DashboardLayout>) {
  return <DashboardLayout {...props} />;
}

export function AdminLayout(props: React.ComponentProps<typeof DashboardLayout>) {
  return <DashboardLayout {...props} />;
}

export function ScannerLayout({
  children,
  header,
  className,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      {header}
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

export function MobileLayout({ children, bottomNav, className }: { children: React.ReactNode; bottomNav?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <div className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))]">{children}</div>
      {bottomNav}
    </div>
  );
}

export { PageLayout };
