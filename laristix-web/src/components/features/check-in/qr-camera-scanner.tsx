"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrCameraScannerProps {
  onScan: (decodedText: string) => void;
  paused?: boolean;
  className?: string;
}

function isIgnorableCameraError(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false;
  }

  return err.name === "AbortError" || err.name === "NotAllowedError";
}

export function QrCameraScanner({ onScan, paused = false, className }: QrCameraScannerProps) {
  const containerId = useId().replace(/:/g, "");
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  const pausedRef = useRef(paused);
  const wasPausedRef = useRef(false);
  const lastScanRef = useRef<{ value: string; at: number } | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const scanner = scannerRef.current;

    if (!scanner || !isActive) {
      return;
    }

    if (paused) {
      void scanner.pause(true);
    } else if (wasPausedRef.current) {
      void scanner.resume();
    }

    wasPausedRef.current = paused;
  }, [paused, isActive]);

  useEffect(() => {
    return () => {
      void cleanupScanner();
    };
  }, []);

  async function cleanupScanner() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    wasPausedRef.current = false;

    if (!scanner) {
      return;
    }

    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      // ignore cleanup errors
    }
  }

  async function startScanner() {
    setError(null);
    setIsStarting(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      await cleanupScanner();

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      wasPausedRef.current = false;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const edge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.max(200, Math.floor(edge * 0.72));

            return { width: size, height: size };
          },
        },
        (decodedText) => {
          if (pausedRef.current) {
            return;
          }

          const now = Date.now();
          const last = lastScanRef.current;

          if (last && last.value === decodedText && now - last.at < 4000) {
            return;
          }

          lastScanRef.current = { value: decodedText, at: now };
          onScanRef.current(decodedText);
        },
        () => {
          // ignore per-frame scan misses
        },
      );

      setIsActive(true);
    } catch (err) {
      if (!isIgnorableCameraError(err)) {
        setError(
          err instanceof Error
            ? err.message
            : "Tidak dapat mengakses kamera. Izinkan akses kamera di browser Anda.",
        );
      }

      await cleanupScanner();
      setIsActive(false);
    } finally {
      setIsStarting(false);
    }
  }

  async function stopScanner() {
    await cleanupScanner();
    setIsActive(false);
    setError(null);
  }

  return (
    <div className={className}>
      <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-border/80 bg-black shadow-sm md:min-h-[520px]">
        <div
          id={containerId}
          className="min-h-[420px] w-full [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover md:min-h-[520px]"
        />

        <div className="pointer-events-none absolute inset-0 z-[5]">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/35" />
          <div className="absolute left-1/2 top-1/2 h-[58vw] w-[58vw] max-h-[320px] max-w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.28)]" />
        </div>

        {!isActive ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-muted/90 p-6 text-center">
            <Camera className="size-12 text-muted-foreground" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Aktifkan kamera untuk memindai QR code tiket secara langsung.
            </p>
            <Button
              type="button"
              onClick={startScanner}
              disabled={isStarting}
              className="h-12 bg-brand px-6 text-base hover:bg-brand-hover"
            >
              {isStarting ? "Menyalakan kamera..." : "Mulai scan kamera"}
            </Button>
          </div>
        ) : null}

        {isStarting ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-sm font-medium text-white">
            Menyalakan kamera...
          </div>
        ) : null}
      </div>

      {isActive ? (
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="outline" onClick={stopScanner} className="h-12 px-5 text-base">
            <CameraOff className="mr-2 size-4" />
            Matikan kamera
          </Button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      {paused && isActive ? (
        <p className="mt-3 text-sm font-medium text-amber-600">Memproses check-in...</p>
      ) : null}
    </div>
  );
}
