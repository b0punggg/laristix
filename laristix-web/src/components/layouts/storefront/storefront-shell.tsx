import { Suspense } from "react";
import { StorefrontFooter } from "./storefront-footer";
import { StorefrontHeader } from "./storefront-header";
import { StorefrontMobileNav } from "./storefront-mobile-nav";
import { StorefrontTopBar } from "./storefront-top-bar";
import { cn } from "@/lib/utils";

interface StorefrontShellProps {
  children: React.ReactNode;
}

function HeaderFallback() {
  return <div className="h-[120px] border-b bg-white" />;
}

export function StorefrontShell({ children }: StorefrontShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StorefrontTopBar />
      <Suspense fallback={<HeaderFallback />}>
        <StorefrontHeader />
      </Suspense>
      <main className={cn("flex-1 pb-20 md:pb-0")}>{children}</main>
      <div className="hidden md:block">
        <StorefrontFooter />
      </div>
      <Suspense fallback={null}>
        <StorefrontMobileNav />
      </Suspense>
    </div>
  );
}
