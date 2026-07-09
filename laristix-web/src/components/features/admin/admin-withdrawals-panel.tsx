"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileText, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminWithdrawalsQuery,
  useUpdateAdminWithdrawalMutation,
  useUploadAdminWithdrawalDocumentMutation,
} from "@/hooks/use-admin-settings";
import { formatIdr } from "@/lib/format";
import type { AdminWithdrawal } from "@/types/admin";

function WithdrawalRow({
  withdrawal,
  onUpdate,
  isUpdating,
  onUploadDocument,
  isUploading,
}: {
  withdrawal: AdminWithdrawal;
  onUpdate: (payload: {
    uuid: string;
    status: AdminWithdrawal["status"];
    notes: string;
    invoice_number: string;
    invoice_url: string;
    supporting_document_url: string;
    transfer_proof_url: string;
  }) => void;
  onUploadDocument: (
    uuid: string,
    type: "invoice" | "supporting_document" | "transfer_proof",
    file: File,
  ) => void;
  isUpdating: boolean;
  isUploading: boolean;
}) {
  const [status, setStatus] = useState<AdminWithdrawal["status"]>(withdrawal.status);
  const [notes, setNotes] = useState(withdrawal.notes ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(withdrawal.invoice_number ?? "");
  const [invoiceUrl, setInvoiceUrl] = useState(withdrawal.invoice_url ?? "");
  const [supportingDocumentUrl, setSupportingDocumentUrl] = useState(
    withdrawal.supporting_document_url ?? "",
  );
  const [transferProofUrl, setTransferProofUrl] = useState(withdrawal.transfer_proof_url ?? "");

  return (
    <div className="rounded-2xl border border-border/70 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="font-semibold">{formatIdr(withdrawal.amount)}</p>
          <p className="text-sm text-muted-foreground">
            {withdrawal.organizer?.name} · {withdrawal.event?.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {withdrawal.bank_name} · {withdrawal.account_holder} · {withdrawal.account_number}
          </p>
          <p className="text-xs text-muted-foreground">
            Diminta:{" "}
            {withdrawal.requested_at
              ? new Date(withdrawal.requested_at).toLocaleString("id-ID")
              : "—"}
          </p>
          {(withdrawal.invoice_number ||
            withdrawal.invoice_url ||
            withdrawal.supporting_document_url ||
            withdrawal.transfer_proof_url) ? (
            <div className="pt-1 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-1 text-foreground">
                <FileText className="size-3" />
                Dokumen payout
              </div>
              {withdrawal.invoice_number ? <p>Invoice: {withdrawal.invoice_number}</p> : null}
              {withdrawal.invoice_url ? <p>URL invoice: {withdrawal.invoice_url}</p> : null}
              {withdrawal.supporting_document_url ? (
                <p>SOT/dokumen: {withdrawal.supporting_document_url}</p>
              ) : null}
              {withdrawal.transfer_proof_url ? (
                <p>Bukti transfer: {withdrawal.transfer_proof_url}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 lg:min-w-[320px]">
          <Select value={status} onChange={(event) => setStatus(event.target.value as AdminWithdrawal["status"])}>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder="Catatan admin"
          />
          <input
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
            placeholder="Nomor invoice"
          />
          <input
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={invoiceUrl}
            onChange={(event) => setInvoiceUrl(event.target.value)}
            placeholder="URL invoice"
          />
          <input
            type="file"
            className="text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUploadDocument(withdrawal.uuid, "invoice", file);
              }
            }}
            disabled={isUploading}
          />
          <input
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={supportingDocumentUrl}
            onChange={(event) => setSupportingDocumentUrl(event.target.value)}
            placeholder="URL SOT / dokumen pendukung"
          />
          <input
            type="file"
            className="text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUploadDocument(withdrawal.uuid, "supporting_document", file);
              }
            }}
            disabled={isUploading}
          />
          <input
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={transferProofUrl}
            onChange={(event) => setTransferProofUrl(event.target.value)}
            placeholder="URL bukti transfer"
          />
          <input
            type="file"
            className="text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUploadDocument(withdrawal.uuid, "transfer_proof", file);
              }
            }}
            disabled={isUploading}
          />
          <Button
            type="button"
            onClick={() =>
              onUpdate({
                uuid: withdrawal.uuid,
                status,
                notes,
                invoice_number: invoiceNumber,
                invoice_url: invoiceUrl,
                supporting_document_url: supportingDocumentUrl,
                transfer_proof_url: transferProofUrl,
              })
            }
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Simpan status
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminWithdrawalsPanel({ standalone = false }: { standalone?: boolean }) {
  const { data, isLoading, isError, refetch } = useAdminWithdrawalsQuery();
  const updateMutation = useUpdateAdminWithdrawalMutation();
  const uploadMutation = useUploadAdminWithdrawalDocumentMutation();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "processing" | "paid" | "rejected"
  >("all");
  const [search, setSearch] = useState("");

  const pendingCount =
    data?.filter((item) => item.status === "pending" || item.status === "processing").length ?? 0;
  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return (data ?? []).filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        item.organizer?.name ?? "",
        item.event?.title ?? "",
        item.bank_name,
        item.account_holder,
        item.account_number,
        item.invoice_number ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [data, search, statusFilter]);

  return (
    <Card className="rounded-3xl border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="size-4 text-muted-foreground" />
          {standalone ? "Manajemen Penarikan Dana Organizer" : "Penarikan Dana Organizer"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {standalone ? (
          <p className="text-sm text-muted-foreground">
            Kelola seluruh request penarikan organizer, update status payout, dan unggah dokumen pendukung.
          </p>
        ) : null}
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm">
          <Clock3 className="size-4 text-brand" />
          <p className="text-muted-foreground">
            {pendingCount} permintaan sedang menunggu proses admin.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "all" | "pending" | "processing" | "paid" | "rejected",
              )
            }
          >
            <option value="all">Semua status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari organizer, event, rekening, atau invoice"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Gagal memuat data penarikan.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : filteredData.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada permintaan penarikan.</p>
        ) : (
          <div className="space-y-3">
            {filteredData.map((withdrawal) => (
              <WithdrawalRow
                key={withdrawal.uuid}
                withdrawal={withdrawal}
                isUpdating={updateMutation.isPending}
                isUploading={uploadMutation.isPending}
                onUploadDocument={(uuid, type, file) =>
                  uploadMutation.mutate({ uuid, type, file })
                }
                onUpdate={(payload) =>
                  updateMutation.mutate({
                    uuid: payload.uuid,
                    payload: {
                      status: payload.status,
                      notes: payload.notes || null,
                      invoice_number: payload.invoice_number || null,
                      invoice_url: payload.invoice_url || null,
                      supporting_document_url: payload.supporting_document_url || null,
                      transfer_proof_url: payload.transfer_proof_url || null,
                    },
                  })
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
