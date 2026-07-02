"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/config/env";
import { useAuthSessionQuery } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
  requireEmailVerified?: boolean;
  requireOrganizer?: boolean;
  allowedRoles?: string[];
  preserveReturnUrl?: boolean;
}

function AuthGuardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Loading...
    </div>
  );
}

function AuthGuardInner({
  children,
  requireEmailVerified = true,
  requireOrganizer = false,
  allowedRoles,
  preserveReturnUrl = false,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const { isLoading, isError, data, isFetched } = useAuthSessionQuery(isHydrated);

  const currentUser = isFetched ? data : undefined;

  useEffect(() => {
    if (!isHydrated || !isFetched || isLoading) {
      return;
    }

    if (isError || !currentUser) {
      const returnTo = preserveReturnUrl
        ? `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
        : null;

      router.replace(
        returnTo ? routes.loginWithRedirect(returnTo) : routes.login,
      );
      return;
    }

    if (requireEmailVerified && !currentUser.email_verified) {
      router.replace(routes.verifyEmail);
      return;
    }

    if (requireOrganizer && !currentUser.active_organizer) {
      router.replace(routes.selectOrganizer);
      return;
    }

    if (allowedRoles?.length && !allowedRoles.includes(currentUser.primary_role)) {
      router.replace(routes.home);
    }
  }, [
    allowedRoles,
    currentUser,
    isError,
    isFetched,
    isHydrated,
    isLoading,
    pathname,
    preserveReturnUrl,
    requireEmailVerified,
    requireOrganizer,
    router,
    searchParams,
  ]);

  if (!isHydrated || !isFetched || isLoading) {
    return <AuthGuardFallback />;
  }

  if (isError || !currentUser) {
    return null;
  }

  if (requireEmailVerified && !currentUser.email_verified) {
    return null;
  }

  if (requireOrganizer && !currentUser.active_organizer) {
    return null;
  }

  if (allowedRoles?.length && !allowedRoles.includes(currentUser.primary_role)) {
    return null;
  }

  return <>{children}</>;
}

export function AuthGuard(props: AuthGuardProps) {
  return (
    <Suspense fallback={<AuthGuardFallback />}>
      <AuthGuardInner {...props} />
    </Suspense>
  );
}
