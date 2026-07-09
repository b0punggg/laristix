import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { CreateOrganizerForm } from "@/components/features/organizer/create-organizer-form";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function CreateOrganizerPage() {
  return (
    <AuthGuard requireOrganizer={false} preserveReturnUrl>
      <AuthLayout
        variant="organizer"
        title="Buat organizer"
        description="Siapkan workspace untuk mengelola dan menjual tiket event Anda"
      >
        <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
          <CreateOrganizerForm />
        </Suspense>
      </AuthLayout>
    </AuthGuard>
  );
}
