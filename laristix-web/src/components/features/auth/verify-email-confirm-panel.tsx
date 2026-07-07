"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthStatusPanel } from "@/components/features/auth/auth-ui";
import { routes } from "@/config/env";
import { getApiErrorMessage } from "@/lib/api/client";
import { authApi } from "@/services/auth/auth-api";

export function VerifyEmailConfirmPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) {
      return;
    }

    const id = searchParams.get("id");
    const hash = searchParams.get("hash");
    const expires = searchParams.get("expires");
    const signature = searchParams.get("signature");

    if (!id || !hash || !expires || !signature) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    hasVerified.current = true;

    authApi
      .verifyEmail(id, hash, { expires, signature })
      .then((response) => {
        setStatus("success");
        setMessage(response.message ?? "Email verified successfully.");
        toast.success("Email verified. You can sign in now.");
        router.replace(routes.login);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(getApiErrorMessage(error, "Verification link is invalid or has expired."));
      });
  }, [router, searchParams]);

  return (
    <AuthStatusPanel
      status={status}
      loadingMessage={message}
      successTitle="Email terverifikasi"
      successMessage={message}
      errorMessage={message}
    >
      {status === "error" ? (
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href={routes.login}>Back to sign in</Link>
          </Button>
        </div>
      ) : null}
    </AuthStatusPanel>
  );
}
