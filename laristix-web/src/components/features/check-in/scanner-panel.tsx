"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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

export function ScannerPanel({ eventUuid, eventTitle }: ScannerPanelProps) {
  const [ticketCode, setTicketCode] = useState("");
  const [gateId, setGateId] = useState<string>("");
  const [preview, setPreview] = useState<CheckInVerifyResult | null>(null);
  const [autoCheckIn, setAutoCheckIn] = useState(true);

  const gatesQuery = useCheckInGatesQuery(eventUuid);
  const scanMutation = useScanCheckInMutation(eventUuid);
  const manualMutation = useManualCheckInMutation(eventUuid);

  const selectedGateId = gateId ? Number(gateId) : undefined;
  const isBusy = scanMutation.isPending || manualMutation.isPending;

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
        toast.success(result.message ?? "Check-in berhasil.");
      } catch {
        setPreview({
          valid: false,
          ticket: null,
          message: "QR tidak valid atau tiket sudah digunakan.",
        });
      }
    },
    [applyScanResult, scanMutation, selectedGateId],
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

    const result = await manualMutation.mutateAsync({
      ticket_code: ticketCode.trim(),
      gate_id: selectedGateId,
    });

    applyScanResult(result.message, result.data);
    setTicketCode("");
    toast.success(result.message ?? "Check-in manual berhasil.");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Scanner Check-in</h2>
        {eventTitle ? <p className="text-sm text-muted-foreground">{eventTitle}</p> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gate (opsional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={gateId} onChange={(e) => setGateId(e.target.value)}>
            <option value="">Semua gate / tanpa gate</option>
            {(gatesQuery.data ?? []).map((gate) => (
              <option key={gate.id} value={gate.id}>
                {gate.name} ({gate.code})
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Scan QR dengan Kamera</CardTitle>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={autoCheckIn}
              onChange={(e) => setAutoCheckIn(e.target.checked)}
            />
            Auto check-in
          </label>
        </CardHeader>
        <CardContent className="space-y-4">
          <QrCameraScanner onScan={handleCameraScan} paused={isBusy} />
          <p className="text-xs text-muted-foreground">
            Arahkan kamera ke QR code pada tiket peserta. Check-in otomatis setelah QR terbaca.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Check-in Manual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="ticket-code">Kode tiket</Label>
            <Input
              id="ticket-code"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              placeholder="ABC123XYZ0"
              autoComplete="off"
            />
          </div>
          <Button type="button" onClick={handleManual} disabled={isBusy}>
            Check-in manual
          </Button>
        </CardContent>
      </Card>

      {preview ? (
        <Card className={preview.valid ? "border-emerald-300" : "border-destructive/40"}>
          <CardContent className="flex gap-3 pt-6">
            {preview.valid ? (
              <CheckCircle2 className="size-8 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="size-8 shrink-0 text-destructive" />
            )}
            <div className="space-y-1 text-sm">
              <p className="font-medium">{preview.message}</p>
              {preview.ticket ? (
                <>
                  <p>Kode: {preview.ticket.ticket_code}</p>
                  {preview.ticket.attendee_name ? <p>Nama: {preview.ticket.attendee_name}</p> : null}
                  {preview.ticket.ticket_type ? <p>Tiket: {preview.ticket.ticket_type}</p> : null}
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
