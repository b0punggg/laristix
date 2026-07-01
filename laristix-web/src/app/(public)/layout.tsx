import { Suspense } from "react";
import { StorefrontShell } from "@/components/layouts/storefront/storefront-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <StorefrontShell>{children}</StorefrontShell>;
}
