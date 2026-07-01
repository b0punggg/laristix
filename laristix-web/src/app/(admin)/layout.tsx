import { AuthGuard } from "@/components/features/auth/auth-guard";
import { adminNavItems, DashboardShell } from "@/components/layouts/dashboard-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="Platform Admin" navItems={adminNavItems}>
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
