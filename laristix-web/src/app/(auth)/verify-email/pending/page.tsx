import { Suspense } from "react";
import { GuestGuard } from "@/components/features/auth/guest-guard";
import { VerifyEmailPendingPanel } from "@/components/features/auth/verify-email-pending-panel";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthLoadingState } from "@/components/features/auth/auth-ui";

export default function VerifyEmailPendingPage() {
  return (
    <GuestGuard>
      <AuthLayout
        variant="verify"
        title="Check your email"
        description="Verify your email address to activate your account"
      >
        <Suspense fallback={<AuthLoadingState message="Loading..." />}>
          <VerifyEmailPendingPanel />
        </Suspense>
      </AuthLayout>
    </GuestGuard>
  );
}
