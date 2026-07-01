"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/env";
import { getApiErrorMessage } from "@/lib/api/client";
import { authApi } from "@/services/auth/auth-api";

export function VerifyEmailPendingPanel() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [isSending, setIsSending] = useState(false);

  async function handleResend() {
    if (!email) {
      toast.error("Email address is missing. Please register again.");
      return;
    }

    setIsSending(true);

    try {
      const response = await authApi.resendVerificationPublic(email);
      toast.success(response.message ?? "Verification email sent.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not resend verification email."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <strong>{email || "your email address"}</strong>. Open the link in the email to verify
          your account before signing in. Check your spam folder if you do not see it within a few
          minutes.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={handleResend} disabled={isSending}>
            {isSending ? "Sending..." : "Resend verification email"}
          </Button>
          <Button asChild variant="ghost">
            <Link href={routes.login}>Go to sign in</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
