import { roleRoutes, routes } from "@/config/env";

export function resolveAuthRedirectPath(
  primaryRole: string,
  redirectTo?: string | null,
): string {
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return roleRoutes[primaryRole] ?? routes.home;
}
