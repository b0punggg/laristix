"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMeQuery } from "@/hooks/use-auth";
import { resolveAuthRedirectPath } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/auth-store";

function GuestGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const { isLoading, isSuccess, data } = useMeQuery(isHydrated && user !== null);

  const currentUser = data ?? user;

  useEffect(() => {
    if (!isHydrated || isLoading) {
      return;
    }

    if (isSuccess && currentUser) {
      router.replace(resolveAuthRedirectPath(currentUser.primary_role, redirectTo));
    }
  }, [currentUser, isHydrated, isLoading, isSuccess, redirectTo, router]);

  if (!isHydrated || (user !== null && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (currentUser) {
    return null;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <GuestGuardInner>{children}</GuestGuardInner>
    </Suspense>
  );
}
