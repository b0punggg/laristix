import { Suspense } from "react";
import { GuestGuard } from "@/components/features/auth/guest-guard";
import { VerifyEmailPendingPanel } from "@/components/features/auth/verify-email-pending-panel";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function VerifyEmailPendingPage() {
  return (
    <GuestGuard>
      <AuthLayout
        title="Check your email"
        description="Verify your email address to activate your account"
      >
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading...</p>}>
          <VerifyEmailPendingPanel />
        </Suspense>
      </AuthLayout>
    </GuestGuard>
  );
}
