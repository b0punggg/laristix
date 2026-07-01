import { AuthGuard } from "@/components/features/auth/auth-guard";
import { VerifyEmailPanel } from "@/components/features/auth/verify-email-panel";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function VerifyEmailPage() {
  return (
    <AuthGuard requireEmailVerified={false}>
      <AuthLayout title="Verify your email" description="Check your inbox for the verification link">
        <VerifyEmailPanel />
      </AuthLayout>
    </AuthGuard>
  );
}
