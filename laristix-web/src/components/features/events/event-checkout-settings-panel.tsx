"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import { EventPromoCodesSection } from "@/components/features/events/event-promo-codes-section";
import { EventSubNav } from "@/components/features/events/event-sub-nav";
import { routes } from "@/config/env";
import { useEventQuery, useUpdateEventMutation } from "@/hooks/use-events";
import { useOrganizerFeePreviewQuery } from "@/hooks/use-organizer-fee-preview";
import { buildEventSettings } from "@/lib/event-settings";
import {
  parseEventFinanceSettings,
  type EventFinanceSettings,
} from "@/lib/event-finance-settings";
import {
  CHECKOUT_BUYER_FIELD_LABELS,
  parseEventCheckoutSettings,
  simulateCheckoutPricing,
  type CheckoutBuyerFieldKey,
  type CheckoutFeeBearer,
  type EventCheckoutSettings,
} from "@/lib/event-checkout-settings";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface EventCheckoutSettingsPanelProps {
  eventUuid: string;
}

const buyerFieldKeys = Object.keys(CHECKOUT_BUYER_FIELD_LABELS) as CheckoutBuyerFieldKey[];

export function EventCheckoutSettingsPanel({ eventUuid }: EventCheckoutSettingsPanelProps) {
  const eventQuery = useEventQuery(eventUuid);
  const updateMutation = useUpdateEventMutation(eventUuid);
  const [settings, setSettings] = useState<EventCheckoutSettings | null>(null);
  const [financeSettings, setFinanceSettings] = useState<EventFinanceSettings | null>(null);
  const [simulationPrice, setSimulationPrice] = useState(100000);

  useEffect(() => {
    if (eventQuery.data) {
      setSettings(parseEventCheckoutSettings(eventQuery.data.settings));
      setFinanceSettings(parseEventFinanceSettings(eventQuery.data.settings));
    }
  }, [eventQuery.data]);

  const effectiveFeeBearer: CheckoutFeeBearer =
    settings?.fee_bearer ?? "attendee";

  const feePreviewQuery = useOrganizerFeePreviewQuery(
    {
      subtotal: simulationPrice,
      fee_bearer: effectiveFeeBearer,
    },
    Boolean(settings),
  );

  const localSimulation = useMemo(() => {
    const rate = feePreviewQuery.data?.percentage_rate ?? 0;
    const flat = feePreviewQuery.data?.flat_amount ?? 0;
    return simulateCheckoutPricing(simulationPrice, rate, flat, effectiveFeeBearer);
  }, [effectiveFeeBearer, feePreviewQuery.data, simulationPrice]);

  function updateSettings(patch: Partial<EventCheckoutSettings>) {
    setSettings((current) => (current ? { ...current, ...patch } : current));
  }

  function updateBuyerField(key: CheckoutBuyerFieldKey, patch: Partial<{ enabled: boolean; required: boolean }>) {
    if (!settings || key === "name" || key === "email") {
      return;
    }

    setSettings({
      ...settings,
      buyer_fields: {
        ...settings.buyer_fields,
        [key]: {
          ...settings.buyer_fields[key],
          ...patch,
          required:
            patch.enabled === false
              ? false
              : (patch.required ?? settings.buyer_fields[key].required),
        },
      },
    });
  }

  async function handleSave() {
    if (!eventQuery.data || !settings || !financeSettings) {
      return;
    }

    await updateMutation.mutateAsync({
      settings: buildEventSettings(
        buildEventSettings(eventQuery.data.settings, { checkout: settings }),
        { finance: financeSettings },
      ),
    });
  }

  if (!settings || !financeSettings) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={routes.organizerEvents}>
          <ArrowLeft className="size-4" />
          Kembali ke event
        </Link>
      </Button>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan checkout</h1>
        <p className="text-sm text-muted-foreground">
          Atur formulir pemesan, batas transaksi, dan biaya layanan untuk{" "}
          {eventQuery.data?.title ?? "event ini"}.
        </p>
      </div>

      <EventSubNav eventUuid={eventUuid} eventStatus={eventQuery.data?.status} />

      <FormSectionCard
        title="Formulir data pemesan"
        description="Field default yang ditampilkan saat checkout. Nama dan email selalu wajib."
      >
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            Untuk pertanyaan kustom tambahan, gunakan halaman{" "}
            <Link href={routes.organizerEventRegistration(eventUuid)} className="font-medium text-brand hover:underline">
              Formulir
            </Link>
            .
          </p>
        </div>

        <div className="divide-y rounded-xl border">
          {buyerFieldKeys.map((key) => {
            const field = settings.buyer_fields[key];
            const locked = key === "name" || key === "email";

            return (
              <div key={key} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{CHECKOUT_BUYER_FIELD_LABELS[key]}</p>
                  {locked ? (
                    <p className="text-xs text-muted-foreground">Selalu aktif & wajib</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.enabled}
                      disabled={locked}
                      onCheckedChange={(checked) =>
                        updateBuyerField(key, { enabled: checked === true })
                      }
                    />
                    Aktif
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.required}
                      disabled={locked || !field.enabled}
                      onCheckedChange={(checked) =>
                        updateBuyerField(key, { required: checked === true })
                      }
                    />
                    Wajib
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Pengaturan tambahan"
        description="Aturan transaksi saat pembeli checkout tiket event ini."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="max-tickets"
            label="Maks. tiket per transaksi"
            helpText="Batas jumlah tiket dalam satu checkout (selain batas per jenis tiket)."
          >
            <Input
              id="max-tickets"
              type="number"
              min={1}
              max={20}
              value={settings.max_tickets_per_transaction ?? ""}
              placeholder="Tanpa batas event"
              onChange={(event) => {
                const value = event.target.value;
                updateSettings({
                  max_tickets_per_transaction: value ? Math.max(1, Number(value)) : null,
                });
              }}
            />
          </FormField>
        </div>

        <div className="mt-5 space-y-4">
          <label className="flex items-start gap-3 rounded-xl border p-4">
            <Checkbox
              checked={settings.one_email_per_transaction}
              onCheckedChange={(checked) =>
                updateSettings({ one_email_per_transaction: checked === true })
              }
              className="mt-0.5"
            />
            <span>
              <span className="block font-medium">1 email = 1 transaksi</span>
              <span className="text-sm text-muted-foreground">
                Satu alamat email hanya boleh memiliki satu transaksi aktif/berhasil per event.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border p-4">
            <Checkbox
              checked={settings.one_attendee_per_ticket}
              onCheckedChange={(checked) =>
                updateSettings({ one_attendee_per_ticket: checked === true })
              }
              className="mt-0.5"
            />
            <span>
              <span className="block font-medium">1 tiket = 1 data pemesan</span>
              <span className="text-sm text-muted-foreground">
                Pembeli wajib mengisi data terpisah untuk setiap tiket dalam satu transaksi.
              </span>
            </span>
          </label>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Pengaturan biaya layanan"
        description="Tentukan siapa yang menanggung biaya platform untuk event ini."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              {
                value: "attendee" as const,
                title: "Ditanggung pembeli",
                description: "Biaya layanan ditambahkan ke total pembayaran pembeli.",
              },
              {
                value: "organizer" as const,
                title: "Ditanggung penyelenggara",
                description: "Biaya layanan dipotong dari pendapatan bersih Anda.",
              },
            ] as const
          ).map((option) => {
            const selected = effectiveFeeBearer === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateSettings({ fee_bearer: option.value })}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors",
                  selected
                    ? "border-brand bg-brand-muted/40 ring-1 ring-brand/30"
                    : "border-border/80 hover:bg-muted/30",
                )}
              >
                <p className="font-semibold">{option.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => updateSettings({ fee_bearer: null })}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Gunakan pengaturan default organizer/platform
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4">
          <p className="font-medium">Simulasi pencairan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Perkiraan berdasarkan tarif biaya platform yang berlaku untuk organizer Anda.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
            <FormField id="sim-price" label="Harga tiket (IDR)">
              <Input
                id="sim-price"
                type="number"
                min={0}
                step={1000}
                value={simulationPrice}
                onChange={(event) => setSimulationPrice(Math.max(0, Number(event.target.value) || 0))}
              />
            </FormField>

            <div className="grid gap-2 rounded-xl border bg-background p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Subtotal</p>
                <p className="font-semibold">{formatCurrency(simulationPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Biaya layanan</p>
                <p className="font-semibold">
                  {formatCurrency(localSimulation.platform_fee_total)}
                  {feePreviewQuery.data ? (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      ({feePreviewQuery.data.percentage_rate}% + {formatCurrency(feePreviewQuery.data.flat_amount)})
                    </span>
                  ) : null}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total dibayar pembeli</p>
                <p className="font-semibold">{formatCurrency(localSimulation.total_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pencairan organizer</p>
                <p className="font-semibold text-brand">
                  {formatCurrency(localSimulation.organizer_net_amount)}
                </p>
              </div>
            </div>
          </div>

          {feePreviewQuery.isLoading ? (
            <p className="mt-2 text-xs text-muted-foreground">Memuat tarif biaya...</p>
          ) : null}
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Layanan tambahan / quotation"
        description="Biaya layanan tambahan seperti ground handling akan diperhitungkan di dashboard event."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="quotation-amount"
            label="Nominal quotation (IDR)"
            helpText="Kosongkan atau isi 0 jika tidak ada biaya tambahan."
          >
            <Input
              id="quotation-amount"
              type="number"
              min={0}
              step={1000}
              value={financeSettings.quotation_amount || ""}
              onChange={(event) =>
                setFinanceSettings((current) =>
                  current
                    ? {
                        ...current,
                        quotation_amount: Math.max(0, Number(event.target.value) || 0),
                      }
                    : current,
                )
              }
            />
          </FormField>
          <FormField
            id="quotation-description"
            label="Keterangan quotation"
            helpText="Contoh: Ground handling, crew support, atau layanan tambahan lain."
          >
            <Input
              id="quotation-description"
              value={financeSettings.quotation_description}
              onChange={(event) =>
                setFinanceSettings((current) =>
                  current
                    ? { ...current, quotation_description: event.target.value }
                    : current,
                )
              }
              placeholder="Ground handling"
            />
          </FormField>
        </div>
      </FormSectionCard>

      <EventPromoCodesSection eventUuid={eventUuid} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" asChild>
          <Link href={routes.publicEvent(eventUuid)} target="_blank">
            <ExternalLink className="size-4" />
            Lihat halaman event
          </Link>
        </Button>
        <Button
          className="bg-brand hover:bg-brand-hover"
          disabled={updateMutation.isPending}
          onClick={() => void handleSave()}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan pengaturan"
          )}
        </Button>
      </div>
    </div>
  );
}
