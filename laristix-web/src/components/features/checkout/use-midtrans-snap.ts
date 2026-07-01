"use client";

import { useEffect, useRef } from "react";
import { env } from "@/config/env";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

interface MidtransSnapProps {
  snapToken: string;
  clientKey?: string | null;
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

export function useMidtransSnap({
  snapToken,
  clientKey,
  onSuccess,
  onPending,
  onError,
  onClose,
}: MidtransSnapProps) {
  const openedRef = useRef(false);
  const effectiveClientKey = clientKey || env.midtransClientKey;

  useEffect(() => {
    if (!snapToken || !effectiveClientKey || openedRef.current) {
      return;
    }

    const scriptId = "midtrans-snap-script";
    const snapUrl = env.midtransIsProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    const openSnap = () => {
      if (!window.snap || openedRef.current) {
        return;
      }

      openedRef.current = true;

      window.snap.pay(snapToken, {
        onSuccess: () => onSuccess?.(),
        onPending: () => onPending?.(),
        onError: () => onError?.(),
        onClose: () => onClose?.(),
      });
    };

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existing) {
      existing.dataset.clientKey = effectiveClientKey;
      openSnap();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = snapUrl;
    script.dataset.clientKey = effectiveClientKey;
    script.async = true;
    script.onload = openSnap;
    document.body.appendChild(script);
  }, [snapToken, effectiveClientKey, onSuccess, onPending, onError, onClose]);
}
