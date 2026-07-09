import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { OrganizerPicker } from "@/components/features/auth/organizer-picker";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function SelectOrganizerPage() {
  return (
    <AuthGuard requireOrganizer={false}>
      <AuthLayout
        variant="organizer"
        wide
        title="Pilih organizer"
        description="Terima undangan tim atau pilih workspace organizer Anda"
      >
        <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
          <OrganizerPicker />
        </Suspense>
      </AuthLayout>
    </AuthGuard>
  );
}
