import { AuthGuard } from "@/components/features/auth/auth-guard";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["staff", "organizer", "super_admin"]}>
      <DashboardShell title="Scanner" useOrganizerNav>
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
