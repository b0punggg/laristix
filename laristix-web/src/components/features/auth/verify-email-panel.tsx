"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLogoutMutation, useResendVerificationMutation } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export function VerifyEmailPanel() {
  const user = useAuthStore((s) => s.user);
  const resend = useResendVerificationMutation();
  const logout = useLogoutMutation();

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <p className="text-sm text-muted-foreground">
          We sent a verification link to <strong>{user?.email}</strong>. Please verify your email
          before continuing.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
          >
            {resend.isPending ? "Sending..." : "Resend verification email"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
