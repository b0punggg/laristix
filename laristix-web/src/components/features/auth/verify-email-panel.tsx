"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useLogoutMutation, useResendVerificationMutation } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export function VerifyEmailPanel() {
  const user = useAuthStore((s) => s.user);
  const resend = useResendVerificationMutation();
  const logout = useLogoutMutation();

  return (
    <div className="space-y-5">
      <Alert variant="info" title="Verifikasi diperlukan">
        Kami mengirim tautan verifikasi ke email Anda. Verifikasi akun sebelum melanjutkan.
      </Alert>

      <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
          <Mail className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Email terdaftar</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Buka email dan klik tautan verifikasi. Jika tidak menemukannya, periksa folder spam atau
        kirim ulang email verifikasi.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-11 sm:flex-1"
          onClick={() => resend.mutate()}
          disabled={resend.isPending}
        >
          {resend.isPending ? "Sending..." : "Resend verification email"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 sm:flex-1"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
