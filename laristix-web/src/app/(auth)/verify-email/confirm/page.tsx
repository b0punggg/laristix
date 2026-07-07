import { Suspense } from "react";
import { VerifyEmailConfirmPanel } from "@/components/features/auth/verify-email-confirm-panel";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthLoadingState } from "@/components/features/auth/auth-ui";

export default function VerifyEmailConfirmPage() {
  return (
    <AuthLayout
      variant="verify"
      title="Email verification"
      description="Confirming your email address"
    >
      <Suspense fallback={<AuthLoadingState message="Verifying..." />}>
        <VerifyEmailConfirmPanel />
      </Suspense>
    </AuthLayout>
  );
}
