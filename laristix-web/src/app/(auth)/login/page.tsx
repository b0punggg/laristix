import { GuestGuard } from "@/components/features/auth/guest-guard";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { LoginForm } from "@/components/features/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <GuestGuard>
      <AuthLayout title="Sign in" description="Access your Laristix account">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
          <LoginForm />
        </Suspense>
      </AuthLayout>
    </GuestGuard>
  );
}
