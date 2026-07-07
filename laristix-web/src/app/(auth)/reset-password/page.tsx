import { Suspense } from "react";
import { GuestGuard } from "@/components/features/auth/guest-guard";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthLoadingState } from "@/components/features/auth/auth-ui";

export default function ResetPasswordPage() {
  return (
    <GuestGuard>
      <AuthLayout
        variant="security"
        title="Reset password"
        description="Choose a new password for your account"
      >
        <Suspense fallback={<AuthLoadingState message="Loading form..." />}>
          <ResetPasswordForm />
        </Suspense>
      </AuthLayout>
    </GuestGuard>
  );
}
