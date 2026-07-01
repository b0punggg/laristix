import { AuthGuard } from "@/components/features/auth/auth-guard";
import { CreateOrganizerForm } from "@/components/features/organizer/create-organizer-form";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function CreateOrganizerPage() {
  return (
    <AuthGuard requireOrganizer={false} preserveReturnUrl>
      <AuthLayout
        title="Create organizer"
        description="Set up your event organizer workspace on Laristix"
      >
        <CreateOrganizerForm />
      </AuthLayout>
    </AuthGuard>
  );
}
