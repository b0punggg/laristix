import { AuthGuard } from "@/components/features/auth/auth-guard";
import { OrganizerRouteGuard } from "@/components/features/organizer/organizer-route-guard";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

const organizerRoles = ["organizer", "staff"];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireOrganizer allowedRoles={organizerRoles}>
      <OrganizerRouteGuard>
        <DashboardShell title="Organizer" useOrganizerNav>
          {children}
        </DashboardShell>
      </OrganizerRouteGuard>
    </AuthGuard>
  );
}
