"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleOff,
  Clock3,
  History,
  Keyboard,
  QrCode,
  ScanLine,
  ShieldAlert,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSectionCard, FormTabButton } from "@/components/features/events/event-management-ui";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  useCheckInGatesQuery,
  useManualCheckInMutation,
  useScanCheckInMutation,
} from "@/hooks/use-check-in";
import type { CheckInRecord, CheckInVerifyResult } from "@/types/check-in";

const QrCameraScanner = dynamic(
  () => import("./qr-camera-scanner").then((mod) => mod.QrCameraScanner),
  {
    ssr: false,
    loading: () => <p className="text-sm text-muted-foreground">Memuat kamera...</p>,
  },
);

interface ScannerPanelProps {
  eventUuid: string;
  eventTitle?: string;
}

interface ScanHistoryItem {
  id: string;
  type: "success" | "already_checked_in" | "invalid";
  message: string;
  ticketCode?: string;
  attendeeName?: string | null;
  ticketType?: string;
  time: string;
}

function formatScannerTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function ScannerPanel({ eventUuid, eventTitle }: ScannerPanelProps) {
  const [ticketCode, setTicketCode] = useState("");
  const [gateId, setGateId] = useState<string>("");
  const [preview, setPreview] = useState<CheckInVerifyResult | null>(null);
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [activeInput, setActiveInput] = useState<"camera" | "manual">("camera");
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  const gatesQuery = useCheckInGatesQuery(eventUuid);
  const scanMutation = useScanCheckInMutation(eventUuid);
  const manualMutation = useManualCheckInMutation(eventUuid);

  const selectedGateId = gateId ? Number(gateId) : undefined;
  const isBusy = scanMutation.isPending || manualMutation.isPending;
  const latestHistory = history.slice(0, 8);

  useEffect(() => {
    const handleOnline = () => setIsOnline(window.navigator.onLine);
    handleOnline();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOnline);
    };
  }, []);

  const scannerStatus = useMemo(() => {
    if (!preview) return null;

    const rawMessage = preview.message.toLowerCase();
    if (preview.valid) {
      return { type: "success" as const, title: "Check-in berhasil", icon: CheckCircle2 };
    }

    if (rawMessage.includes("sudah") || rawMessage.includes("used") || rawMessage.includes("sudah digunakan")) {
      return {
        type: "already_checked_in" as const,
        title: "Sudah check-in",
        icon: AlertTriangle,
      };
    }

    return { type: "invalid" as const, title: "Tiket tidak valid", icon: XCircle };
  }, [preview]);
  const ScannerStatusIcon = scannerStatus?.icon;

  const appendHistory = useCallback((item: Omit<ScanHistoryItem, "id" | "time">) => {
    setHistory((current) => [
      {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        time: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  const applyScanResult = useCallback((message: string, record: CheckInRecord) => {
    setPreview({
      valid: true,
      ticket: record.ticket
        ? {
            uuid: record.ticket.uuid,
            ticket_code: record.ticket.ticket_code,
            status: "used",
            ticket_type: record.ticket.ticket_type,
            attendee_name: record.attendee?.name,
            attendee_email: record.attendee?.email,
          }
        : null,
      message,
    });
  }, []);

  const processQrToken = useCallback(
    async (qrToken: string) => {
      const trimmed = qrToken.trim();

      if (!trimmed) {
        return;
      }

      try {
        const result = await scanMutation.mutateAsync({
          qr_token: trimmed,
          gate_id: selectedGateId,
        });

        applyScanResult(result.message, result.data);
        appendHistory({
          type: "success",
          message: result.message ?? "Check-in berhasil.",
          ticketCode: result.data.ticket?.ticket_code,
          attendeeName: result.data.attendee?.name,
          ticketType: result.data.ticket?.ticket_type,
        });
        toast.success(result.message ?? "Check-in berhasil.");
      } catch (error) {
        const message = getApiErrorMessage(error, "QR tidak valid atau tiket sudah digunakan.");
        setPreview({
          valid: false,
          ticket: null,
          message,
        });
        appendHistory({
          type:
            message.toLowerCase().includes("sudah") || message.toLowerCase().includes("used")
              ? "already_checked_in"
              : "invalid",
          message,
        });
      }
    },
    [appendHistory, applyScanResult, scanMutation, selectedGateId],
  );

  const handleCameraScan = useCallback(
    (decodedText: string) => {
      if (!autoCheckIn || isBusy) {
        return;
      }

      void processQrToken(decodedText);
    },
    [autoCheckIn, isBusy, processQrToken],
  );

  async function handleManual() {
    if (!ticketCode.trim()) {
      return;
    }

    try {
      const result = await manualMutation.mutateAsync({
        ticket_code: ticketCode.trim(),
        gate_id: selectedGateId,
      });

      applyScanResult(result.message, result.data);
      appendHistory({
        type: "success",
        message: result.message ?? "Check-in manual berhasil.",
        ticketCode: result.data.ticket?.ticket_code,
        attendeeName: result.data.attendee?.name,
        ticketType: result.data.ticket?.ticket_type,
      });
      setTicketCode("");
      toast.success(result.message ?? "Check-in manual berhasil.");
    } catch (error) {
      const message = getApiErrorMessage(error, "Kode tiket tidak valid atau sudah digunakan.");
      setPreview({
        valid: false,
        ticket: null,
        message,
      });
      appendHistory({
        type:
          message.toLowerCase().includes("sudah") || message.toLowerCase().includes("used")
            ? "already_checked_in"
            : "invalid",
        message,
        ticketCode: ticketCode.trim(),
      });
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-brand-muted/70 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge variant="brand" className="rounded-full px-3 py-1">
              Scanner App
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Fast Check-in Scanner</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Dirancang untuk kecepatan di gate masuk dengan area kamera besar, tombol besar,
                kontras tinggi, dan feedback hasil scan yang jelas.
              </p>
            </div>
            {eventTitle ? <p className="text-sm text-muted-foreground">{eventTitle}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
              <p className="text-xs text-muted-foreground">Mode</p>
              <p className="mt-1 text-sm font-semibold">Speed-first scanning</p>
            </div>
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
              <p className="text-xs text-muted-foreground">Input</p>
              <p className="mt-1 text-sm font-semibold">
                {activeInput === "camera" ? "QR Camera" : "Manual Code"}
              </p>
            </div>
            <div
              className={cn(
                "rounded-2xl p-4 ring-1",
                isOnline
                  ? "bg-success-muted/50 text-success ring-success/20"
                  : "bg-danger-muted/40 text-danger ring-danger/20",
              )}
            >
              <div className="flex items-center gap-2">
                {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
                <div>
                  <p className="text-xs opacity-80">Offline indicator</p>
                  <p className="text-sm font-semibold">{isOnline ? "Online" : "Offline"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <FormSectionCard
            title="Scanner Setup"
            description="Pilih gate dan mode input untuk mulai memproses tiket."
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-2">
                <p className="text-sm font-medium">Gate</p>
                {gatesQuery.isLoading ? (
                  <Skeleton className="h-12 w-full rounded-xl" />
                ) : (
                  <Select value={gateId} onChange={(e) => setGateId(e.target.value)} className="h-12">
                    <option value="">Semua gate / tanpa gate</option>
                    {(gatesQuery.data ?? []).map((gate) => (
                      <option key={gate.id} value={gate.id}>
                        {gate.name} ({gate.code})
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                <FormTabButton active={activeInput === "camera"} onClick={() => setActiveInput("camera")}>
                  Camera
                </FormTabButton>
                <FormTabButton active={activeInput === "manual"} onClick={() => setActiveInput("manual")}>
                  Manual
                </FormTabButton>
              </div>
            </div>
          </FormSectionCard>

          {activeInput === "camera" ? (
            <FormSectionCard
              title="Large QR Camera"
              description="Area kamera besar untuk scanning cepat di ponsel maupun tablet."
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                      <ScanLine className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Auto check-in</p>
                      <p className="text-xs text-muted-foreground">Proses otomatis saat QR terbaca</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoCheckIn((value) => !value)}
                    className={cn(
                      "ds-focus-ring inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors",
                      autoCheckIn
                        ? "bg-brand text-brand-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {autoCheckIn ? "Aktif" : "Nonaktif"}
                  </button>
                </div>

                <QrCameraScanner onScan={handleCameraScan} paused={isBusy} className="w-full" />
              </div>
            </FormSectionCard>
          ) : (
            <FormSectionCard
              title="Manual Code Input"
              description="Masukkan kode tiket secara manual saat QR tidak bisa dipindai."
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                      <Keyboard className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Manual check-in</p>
                      <p className="text-xs text-muted-foreground">Gunakan huruf besar dan angka sesuai kode tiket.</p>
                    </div>
                  </div>
                  <Input
                    id="ticket-code"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                    placeholder="ABC123XYZ0"
                    autoComplete="off"
                    className="h-14 text-lg font-semibold tracking-[0.18em]"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleManual}
                  disabled={isBusy || !ticketCode.trim()}
                  className="h-14 w-full bg-brand text-base hover:bg-brand-hover sm:w-auto sm:px-8"
                >
                  Check-in manual
                </Button>
              </div>
            </FormSectionCard>
          )}

          {preview && scannerStatus ? (
            <section
              className={cn(
                "overflow-hidden rounded-3xl border p-5 shadow-sm transition-all",
                scannerStatus.type === "success" &&
                  "border-success/30 bg-success-muted/30 ring-2 ring-success/15",
                scannerStatus.type === "already_checked_in" &&
                  "border-warning/30 bg-warning-muted/30 ring-2 ring-warning/15",
                scannerStatus.type === "invalid" &&
                  "border-danger/30 bg-danger-muted/30 ring-2 ring-danger/15",
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                    scannerStatus.type === "success" && "bg-success text-success-foreground animate-pulse",
                    scannerStatus.type === "already_checked_in" && "bg-warning-muted text-warning-foreground",
                    scannerStatus.type === "invalid" && "bg-danger text-danger-foreground",
                  )}
                >
                  {ScannerStatusIcon ? <ScannerStatusIcon className="size-7" /> : null}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold">{scannerStatus.title}</p>
                    <Badge
                      variant={
                        scannerStatus.type === "success"
                          ? "success"
                          : scannerStatus.type === "already_checked_in"
                            ? "warning"
                            : "danger"
                      }
                      className="rounded-full"
                    >
                      {scannerStatus.type === "success"
                        ? "Success animation"
                        : scannerStatus.type === "already_checked_in"
                          ? "Already checked-in state"
                          : "Invalid ticket state"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{preview.message}</p>

                  {preview.ticket ? (
                    <div className="grid gap-3 pt-2 sm:grid-cols-3">
                      <div className="rounded-2xl border border-current/10 bg-background/60 p-3">
                        <p className="text-xs text-muted-foreground">Kode</p>
                        <p className="mt-1 font-mono text-sm font-semibold">{preview.ticket.ticket_code}</p>
                      </div>
                      {preview.ticket.attendee_name ? (
                        <div className="rounded-2xl border border-current/10 bg-background/60 p-3">
                          <p className="text-xs text-muted-foreground">Nama</p>
                          <p className="mt-1 text-sm font-semibold">{preview.ticket.attendee_name}</p>
                        </div>
                      ) : null}
                      {preview.ticket.ticket_type ? (
                        <div className="rounded-2xl border border-current/10 bg-background/60 p-3">
                          <p className="text-xs text-muted-foreground">Tiket</p>
                          <p className="mt-1 text-sm font-semibold">{preview.ticket.ticket_type}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          {!isOnline ? (
            <FormSectionCard title="Offline Indicator" description="Status jaringan untuk petugas scanner.">
              <div className="rounded-2xl border border-danger/30 bg-danger-muted/40 p-4 text-sm text-danger">
                <div className="flex items-start gap-3">
                  <WifiOff className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Anda sedang offline</p>
                    <p className="mt-1 text-danger/80">
                      Scanning logic tetap tidak diubah, namun koneksi diperlukan untuk verifikasi check-in.
                    </p>
                  </div>
                </div>
              </div>
            </FormSectionCard>
          ) : null}

          <FormSectionCard title="History" description="Riwayat hasil scan terbaru pada sesi ini.">
            {latestHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center">
                <History className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-medium">Belum ada riwayat scan</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hasil check-in akan muncul di sini setelah Anda memproses tiket.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestHistory.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-2xl border p-4",
                      item.type === "success" && "border-success/20 bg-success-muted/20",
                      item.type === "already_checked_in" && "border-warning/20 bg-warning-muted/20",
                      item.type === "invalid" && "border-danger/20 bg-danger-muted/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{item.message}</p>
                        {item.ticketCode ? (
                          <p className="font-mono text-xs text-muted-foreground">{item.ticketCode}</p>
                        ) : null}
                        {item.attendeeName ? (
                          <p className="text-xs text-muted-foreground">{item.attendeeName}</p>
                        ) : null}
                      </div>
                      <p className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatScannerTime(item.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FormSectionCard>

          <FormSectionCard title="Speed Tips" description="Optimalkan scanning di lapangan.">
            <div className="space-y-3 text-sm">
              {[
                { icon: QrCode, text: "Arahkan QR tepat di tengah frame kamera." },
                { icon: ShieldAlert, text: "Gunakan manual code input jika layar peserta rusak atau redup." },
                { icon: CircleOff, text: "Saat hasil muncul, kamera akan pause sementara agar tidak double scan." },
              ].map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <Icon className="mt-0.5 size-4 shrink-0 text-brand" />
                    <p className="text-muted-foreground">{tip.text}</p>
                  </div>
                );
              })}
            </div>
          </FormSectionCard>
        </div>
      </div>
    </div>
  );
}
