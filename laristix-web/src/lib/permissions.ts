import type { AuthenticatedUser } from "@/types/auth";

const managerRoles = new Set(["owner", "admin"]);

export function canManageEvents(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false;
  }

  if (user.primary_role === "super_admin") {
    return true;
  }

  const role = user.active_membership?.role;

  return role !== undefined && managerRoles.has(role);
}

export function canManageMembers(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false;
  }

  if (user.primary_role === "super_admin") {
    return true;
  }

  const role = user.active_membership?.role;

  return role !== undefined && managerRoles.has(role);
}

export function isScannerRole(user: AuthenticatedUser | null): boolean {
  return user?.active_membership?.role === "scanner";
}

const scannerBlockedPathPrefixes = ["/analytics", "/events", "/team"];

export function isScannerBlockedPath(pathname: string): boolean {
  return scannerBlockedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
