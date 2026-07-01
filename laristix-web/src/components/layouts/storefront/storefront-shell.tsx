import { Suspense } from "react";
import { StorefrontFooter } from "./storefront-footer";
import { StorefrontHeader } from "./storefront-header";
import { StorefrontTopBar } from "./storefront-top-bar";

interface StorefrontShellProps {
  children: React.ReactNode;
}

function HeaderFallback() {
  return <div className="h-[120px] border-b bg-white" />;
}

export function StorefrontShell({ children }: StorefrontShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StorefrontTopBar />
      <Suspense fallback={<HeaderFallback />}>
        <StorefrontHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
