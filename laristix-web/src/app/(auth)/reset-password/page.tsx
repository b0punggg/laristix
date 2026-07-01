import { Suspense } from "react";
import { GuestGuard } from "@/components/features/auth/guest-guard";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function ResetPasswordPage() {
  return (
    <GuestGuard>
      <AuthLayout title="Reset password" description="Choose a new password for your account">
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </AuthLayout>
    </GuestGuard>
  );
}
