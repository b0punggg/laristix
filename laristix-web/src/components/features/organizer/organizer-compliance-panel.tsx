"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import { useOrganizerComplianceQuery, useSubmitComplianceMutation } from "@/hooks/use-phase-c";

const statusLabels = {
  not_submitted: "Belum dikirim",
  pending: "Menunggu verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
} as const;

export function OrganizerCompliancePanel() {
  const complianceQuery = useOrganizerComplianceQuery();
  const submitMutation = useSubmitComplianceMutation();
  const profile = complianceQuery.data;

  const [type, setType] = useState<"individual" | "business">("individual");
  const [legalName, setLegalName] = useState("");
  const [ktpNumber, setKtpNumber] = useState("");
  const [npwpNumber, setNpwpNumber] = useState("");

  const isLocked = profile?.status === "pending" || profile?.status === "verified";

  async function handleSubmit() {
    await submitMutation.mutateAsync({
      type,
      legal_name: legalName,
      ktp_number: type === "individual" ? ktpNumber : undefined,
      npwp_number: type === "business" ? npwpNumber : undefined,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Verifikasi KTP / NPWP</h1>
        <p className="text-sm text-muted-foreground">
          Diperlukan untuk menjual tiket berbayar. Data dikirim ke tim Laristix untuk verifikasi.
        </p>
      </div>

      <FormSectionCard title="Status verifikasi">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="font-medium">
              {profile ? statusLabels[profile.status] : "Memuat..."}
            </p>
            {profile?.rejection_reason ? (
              <p className="text-sm text-destructive">{profile.rejection_reason}</p>
            ) : null}
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard title="Data verifikasi" description="Isi sesuai jenis akun penyelenggara Anda.">
        <div className="grid gap-5">
          <FormField id="compliance-type" label="Jenis akun">
            <Select
              id="compliance-type"
              className="h-11"
              value={type}
              disabled={isLocked}
              onChange={(event) => setType(event.target.value as "individual" | "business")}
            >
              <option value="individual">Perorangan (KTP)</option>
              <option value="business">Badan usaha (NPWP)</option>
            </Select>
          </FormField>
          <FormField id="legal-name" label="Nama lengkap / nama badan usaha" required>
            <Input
              id="legal-name"
              className="h-11"
              value={legalName}
              disabled={isLocked}
              onChange={(event) => setLegalName(event.target.value)}
            />
          </FormField>
          {type === "individual" ? (
            <FormField id="ktp-number" label="Nomor KTP" required>
              <Input
                id="ktp-number"
                className="h-11"
                value={ktpNumber}
                disabled={isLocked}
                onChange={(event) => setKtpNumber(event.target.value)}
              />
            </FormField>
          ) : (
            <FormField id="npwp-number" label="Nomor NPWP" required>
              <Input
                id="npwp-number"
                className="h-11"
                value={npwpNumber}
                disabled={isLocked}
                onChange={(event) => setNpwpNumber(event.target.value)}
              />
            </FormField>
          )}
          <Button
            type="button"
            className="bg-brand hover:bg-brand-hover"
            disabled={isLocked || submitMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim data verifikasi"
            )}
          </Button>
        </div>
      </FormSectionCard>
    </div>
  );
}
