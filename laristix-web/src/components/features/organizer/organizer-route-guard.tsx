"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/config/env";
import { isScannerBlockedPath, isScannerRole } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

export function OrganizerRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user || !isScannerRole(user)) {
      return;
    }

    if (isScannerBlockedPath(pathname)) {
      router.replace(routes.organizerDashboard);
    }
  }, [pathname, router, user]);

  return children;
}
