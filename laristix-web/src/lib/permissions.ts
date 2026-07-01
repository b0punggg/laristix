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
