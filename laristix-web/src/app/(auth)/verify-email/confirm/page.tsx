import { Suspense } from "react";
import { VerifyEmailConfirmPanel } from "@/components/features/auth/verify-email-confirm-panel";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function VerifyEmailConfirmPage() {
  return (
    <AuthLayout title="Email verification" description="Confirming your email address">
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading...</p>}>
        <VerifyEmailConfirmPanel />
      </Suspense>
    </AuthLayout>
  );
}
