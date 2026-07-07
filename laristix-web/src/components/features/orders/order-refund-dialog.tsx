"use client";

import { useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import {
  formatTransactionAmount,
  formatTransactionDate,
  getOrderTransactionDate,
  isSuccessfulOrderStatus,
} from "@/lib/transactions";
import type { CheckoutOrder } from "@/types/checkout";
import { toast } from "sonner";

const refundReasons = [
  { value: "event_cancelled", label: "Event dibatalkan" },
  { value: "cannot_attend", label: "Tidak bisa hadir" },
  { value: "duplicate_order", label: "Order duplikat" },
  { value: "other", label: "Lainnya" },
];

interface OrderRefundDialogProps {
  order: CheckoutOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderRefundDialog({ order, open, onOpenChange }: OrderRefundDialogProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setReason("");
      setNotes("");
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit() {
    if (!order || !reason) {
      return;
    }

    setIsSubmitting(true);

    // UI-only flow: no refund API wired on frontend yet.
    await new Promise((resolve) => window.setTimeout(resolve, 600));

    toast.success("Permintaan refund dicatat. Organizer akan menghubungi Anda via email.");
    setIsSubmitting(false);
    handleClose(false);
  }

  if (!order) {
    return null;
  }

  const canRefund =
    isSuccessfulOrderStatus(order.status) &&
    order.status !== "refunded" &&
    order.status !== "partially_refunded";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="size-5 text-brand" aria-hidden />
            Ajukan refund
          </DialogTitle>
          <DialogDescription>
            Permintaan refund untuk order <span className="font-mono">{order.order_number}</span>
          </DialogDescription>
        </DialogHeader>

        {!canRefund ? (
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle className="size-5 shrink-0" aria-hidden />
            <p>Order ini tidak memenuhi syarat untuk pengajuan refund.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Event</span>
                <span className="text-right font-medium">{order.event?.title ?? "—"}</span>
              </div>
              <div className="mt-2 flex justify-between gap-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold tabular-nums">
                  {formatTransactionAmount(order.total_amount, order.currency)}
                </span>
              </div>
              <div className="mt-2 flex justify-between gap-3">
                <span className="text-muted-foreground">Tanggal</span>
                <span>
                  {formatTransactionDate(getOrderTransactionDate(order), order.event?.timezone)}
                </span>
              </div>
            </div>

            <FormField id="refund-reason" label="Alasan refund" required>
              <Select
                id="refund-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-11"
              >
                <option value="">Pilih alasan</option>
                {refundReasons.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="space-y-2">
              <Label htmlFor="refund-notes">Catatan tambahan</Label>
              <Textarea
                id="refund-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jelaskan detail permintaan refund (opsional)"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Kebijakan refund ditentukan oleh organizer event. Tim akan meninjau permintaan Anda
              dan menghubungi via {order.buyer_email}.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Batal
          </Button>
          {canRefund ? (
            <Button
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
              className="bg-brand hover:bg-brand-hover"
            >
              {isSubmitting ? "Mengirim..." : "Kirim permintaan"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
