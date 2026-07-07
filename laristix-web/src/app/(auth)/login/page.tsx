import { Suspense } from "react";
import { GuestGuard } from "@/components/features/auth/guest-guard";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { LoginForm } from "@/components/features/auth/login-form";
import { AuthLoadingState } from "@/components/features/auth/auth-ui";

export default function LoginPage() {
  return (
    <GuestGuard>
      <AuthLayout
        variant="login"
        title="Sign in"
        description="Access your Laristix account"
      >
        <Suspense fallback={<AuthLoadingState message="Loading form..." />}>
          <LoginForm />
        </Suspense>
      </AuthLayout>
    </GuestGuard>
  );
}
