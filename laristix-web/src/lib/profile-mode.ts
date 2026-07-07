import { routes } from "@/config/env";
import type { AuthenticatedUser } from "@/types/auth";

export function canUseCreatorMode(user: AuthenticatedUser): boolean {
  return (
    user.roles.includes("organizer") ||
    user.roles.includes("staff") ||
    user.primary_role === "organizer" ||
    user.primary_role === "staff" ||
    Boolean(user.active_organizer)
  );
}

export function getCreatorOnboardingRoute(hasOrganizers: boolean): string {
  return hasOrganizers ? routes.selectOrganizer : routes.createOrganizer;
}
