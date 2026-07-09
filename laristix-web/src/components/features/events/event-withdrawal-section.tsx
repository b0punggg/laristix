"use client";

import { useState } from "react";
import { CalendarClock, FileText, Landmark, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEventWithdrawalMutation, useEventWithdrawalsQuery } from "@/hooks/use-event-withdrawals";
import { formatIdr } from "@/lib/format";

interface EventWithdrawalSectionProps {
  eventUuid: string;
  onCreated?: () => void;
}

export function EventWithdrawalSection({ eventUuid, onCreated }: EventWithdrawalSectionProps) {
  const withdrawalsQuery = useEventWithdrawalsQuery(eventUuid);
  const createMutation = useCreateEventWithdrawalMutation(eventUuid);

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    createMutation.mutate(
      {
        amount: Number(amount) || 0,
        bank_name: bankName,
        account_holder: accountHolder,
        account_number: accountNumber,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setAmount("");
          setBankName("");
          setAccountHolder("");
          setAccountNumber("");
          setNotes("");
          onCreated?.();
        },
      },
    );
  }

  const data = withdrawalsQuery.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-4 text-brand" aria-hidden />
            Riwayat penarikan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada permintaan penarikan untuk event ini.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Dana tersedia</p>
                  <p className="mt-1 font-semibold">{formatIdr(data?.available_balance ?? 0)}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Sedang diproses</p>
                  <p className="mt-1 font-semibold">{formatIdr(data?.pending_balance ?? 0)}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Sudah ditarik</p>
                  <p className="mt-1 font-semibold">{formatIdr(data?.withdrawn_total ?? 0)}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-3 font-medium">Tanggal</th>
                      <th className="pb-2 pr-3 font-medium">Rekening</th>
                      <th className="pb-2 pr-3 font-medium">Status</th>
                      <th className="pb-2 font-medium text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.data.map((row) => (
                      <tr key={row.uuid}>
                        <td className="py-3 pr-3 align-top text-muted-foreground">
                          {row.requested_at ? new Date(row.requested_at).toLocaleString("id-ID") : "—"}
                        </td>
                        <td className="py-3 pr-3 align-top">
                          <p className="font-medium text-foreground">{row.bank_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.account_holder} · {row.account_number}
                          </p>
                          {(row.invoice_number ||
                            row.invoice_url ||
                            row.supporting_document_url ||
                            row.transfer_proof_url) ? (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <div className="mb-1 flex items-center gap-1 text-foreground">
                                <FileText className="size-3" />
                                Dokumen payout
                              </div>
                              {row.invoice_number ? <p>Invoice: {row.invoice_number}</p> : null}
                              {row.invoice_url ? (
                                <p>
                                  <a href={row.invoice_url} target="_blank" rel="noreferrer" className="underline">
                                    Buka invoice
                                  </a>
                                </p>
                              ) : null}
                              {row.supporting_document_url ? (
                                <p>
                                  <a href={row.supporting_document_url} target="_blank" rel="noreferrer" className="underline">
                                    Buka SOT / dokumen
                                  </a>
                                </p>
                              ) : null}
                              {row.transfer_proof_url ? (
                                <p>
                                  <a href={row.transfer_proof_url} target="_blank" rel="noreferrer" className="underline">
                                    Buka bukti transfer
                                  </a>
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-3 pr-3 align-top text-muted-foreground">
                          <p>{row.status_label}</p>
                          {(row.status_history?.length ?? 0) > 0 ? (
                            <div className="mt-2 space-y-2 text-xs">
                              {row.status_history.map((item, index) => (
                                <div key={`${row.uuid}-${index}`} className="rounded-lg border border-border/60 p-2">
                                  <p className="font-medium text-foreground">{item.label}</p>
                                  <p>{new Date(item.at).toLocaleString("id-ID")}</p>
                                  {item.notes ? <p>{item.notes}</p> : null}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-3 align-top text-right font-medium">{formatIdr(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="size-4 text-brand" aria-hidden />
            Ajukan penarikan dana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              id="withdraw-amount"
              label="Nominal penarikan"
              helpText={`Tersedia: ${formatIdr(data?.available_balance ?? 0)}`}
            >
              <Input
                id="withdraw-amount"
                type="number"
                min={1}
                step={1000}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="500000"
              />
            </FormField>
            <FormField id="withdraw-bank" label="Nama bank">
              <Input
                id="withdraw-bank"
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                placeholder="BCA"
              />
            </FormField>
            <FormField id="withdraw-holder" label="Nama pemilik rekening">
              <Input
                id="withdraw-holder"
                value={accountHolder}
                onChange={(event) => setAccountHolder(event.target.value)}
                placeholder="PT Acara Sukses"
              />
            </FormField>
            <FormField id="withdraw-number" label="Nomor rekening">
              <div className="relative">
                <Landmark className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="withdraw-number"
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  placeholder="1234567890"
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField id="withdraw-notes" label="Catatan (opsional)">
              <Textarea
                id="withdraw-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Tahap pertama untuk kebutuhan operasional."
                rows={3}
              />
            </FormField>
            <Button
              type="submit"
              disabled={createMutation.isPending || (data?.available_balance ?? 0) <= 0}
              className="w-full"
            >
              {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Ajukan penarikan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
