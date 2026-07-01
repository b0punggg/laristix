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
      <div className="relative min-h-[280px] overflow-hidden rounded-lg border bg-black">
        <div
          id={containerId}
          className="min-h-[280px] w-full [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover"
        />

        {!isActive ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted/90 p-6 text-center">
            <Camera className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aktifkan kamera untuk memindai QR code tiket secara langsung.
            </p>
            <Button type="button" onClick={startScanner} disabled={isStarting}>
              {isStarting ? "Menyalakan kamera..." : "Mulai scan kamera"}
            </Button>
          </div>
        ) : null}

        {isStarting ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-sm text-white">
            Menyalakan kamera...
          </div>
        ) : null}
      </div>

      {isActive ? (
        <div className="mt-3 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={stopScanner}>
            <CameraOff className="mr-2 size-4" />
            Matikan kamera
          </Button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      {paused && isActive ? (
        <p className="mt-2 text-sm text-amber-600">Memproses check-in...</p>
      ) : null}
    </div>
  );
}
