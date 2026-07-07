import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { ProfilePanel } from "@/components/features/profile/profile-panel";

function ProfilePageContent() {
  return (
    <AuthGuard requireEmailVerified={false} preserveReturnUrl>
      <ProfilePanel />
    </AuthGuard>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Memuat profil...
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
