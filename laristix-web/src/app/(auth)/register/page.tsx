import { GuestGuard } from "@/components/features/auth/guest-guard";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { RegisterForm } from "@/components/features/auth/register-form";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <AuthLayout title="Create account" description="Start managing events with Laristix">
        <RegisterForm />
      </AuthLayout>
    </GuestGuard>
  );
}
