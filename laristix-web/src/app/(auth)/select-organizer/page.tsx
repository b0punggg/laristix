import { AuthGuard } from "@/components/features/auth/auth-guard";
import { OrganizerPicker } from "@/components/features/auth/organizer-picker";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function SelectOrganizerPage() {
  return (
    <AuthGuard requireOrganizer={false}>
      <AuthLayout
        title="Select organizer"
        description="Choose which organizer workspace you want to access"
      >
        <OrganizerPicker />
      </AuthLayout>
    </AuthGuard>
  );
}
