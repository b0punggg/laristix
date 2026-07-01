import { GuestGuard } from "@/components/features/auth/guest-guard";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <AuthLayout title="Forgot password" description="We'll email you a reset link">
        <ForgotPasswordForm />
      </AuthLayout>
    </GuestGuard>
  );
}
