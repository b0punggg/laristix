"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AuthSuccessState } from "@/components/features/auth/auth-ui";
import { routes } from "@/config/env";
import { getApiErrorMessage } from "@/lib/api/client";
import { authApi } from "@/services/auth/auth-api";

export function VerifyEmailPendingPanel() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [isSending, setIsSending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!email) {
      toast.error("Email address is missing. Please register again.");
      return;
    }

    setIsSending(true);

    try {
      const response = await authApi.resendVerificationPublic(email);
      toast.success(response.message ?? "Verification email sent.");
      setResent(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not resend verification email."));
    } finally {
      setIsSending(false);
    }
  }

  if (resent) {
    return (
      <AuthSuccessState
        title="Email verifikasi dikirim ulang"
        description={
          <>
            Periksa inbox <strong>{email}</strong> dan klik tautan verifikasi untuk mengaktifkan
            akun Anda.
          </>
        }
      >
        <Button asChild variant="outline" className="mt-2">
          <Link href={routes.login}>Go to sign in</Link>
        </Button>
      </AuthSuccessState>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-brand-muted">
          <Mail className="size-8 text-brand" aria-hidden />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a verification link to{" "}
          <strong className="text-foreground">{email || "your email address"}</strong>. Open the
          link in the email to verify your account before signing in.
        </p>
      </div>

      <Alert variant="info">
        Check your spam folder if you do not see the email within a few minutes.
      </Alert>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-11 sm:flex-1"
          onClick={handleResend}
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Resend verification email"}
        </Button>
        <Button asChild variant="ghost" className="h-11 sm:flex-1">
          <Link href={routes.login}>Go to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
