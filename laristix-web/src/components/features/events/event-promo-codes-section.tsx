"use client";

import { useState } from "react";
import { Loader2, Percent, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import {
  useCreateEventPromoCodeMutation,
  useEventPromoCodesQuery,
} from "@/hooks/use-event-promo-codes";
import { formatIdr } from "@/lib/format";

interface EventPromoCodesSectionProps {
  eventUuid: string;
}

function formatDiscount(type: "percentage" | "fixed", value: number) {
  if (type === "percentage") {
    return `${value}%`;
  }

  return formatIdr(value);
}

export function EventPromoCodesSection({ eventUuid }: EventPromoCodesSectionProps) {
  const promoCodesQuery = useEventPromoCodesQuery(eventUuid);
  const createMutation = useCreateEventPromoCodeMutation(eventUuid);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [usageLimit, setUsageLimit] = useState("");

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    const parsedValue = Number(discountValue);
    if (!code.trim() || !Number.isFinite(parsedValue) || parsedValue <= 0) {
      return;
    }

    createMutation.mutate(
      {
        code: code.trim(),
        description: description.trim() || undefined,
        discount_type: discountType,
        discount_value: parsedValue,
        usage_limit: usageLimit ? Number(usageLimit) : undefined,
      },
      {
        onSuccess: () => {
          setCode("");
          setDescription("");
          setDiscountValue(discountType === "percentage" ? "10" : "10000");
          setUsageLimit("");
        },
      },
    );
  }

  const promoCodes = promoCodesQuery.data ?? [];

  return (
    <FormSectionCard
      title="Kode promo"
      description="Buat kode promo untuk event ini. Pembeli dapat memasukkannya saat checkout."
    >
      <form onSubmit={handleCreate} className="grid gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 lg:grid-cols-2">
        <FormField id="promo-code" label="Kode promo" className="lg:col-span-2">
          <Input
            id="promo-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="EARLYBIRD"
            required
          />
        </FormField>
        <FormField id="promo-description" label="Deskripsi" className="lg:col-span-2">
          <Input
            id="promo-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Diskon early bird"
          />
        </FormField>
        <FormField id="promo-type" label="Jenis diskon">
          <Select
            id="promo-type"
            value={discountType}
            onChange={(event) =>
              setDiscountType(event.target.value as "percentage" | "fixed")
            }
          >
            <option value="percentage">Persentase (%)</option>
            <option value="fixed">Nominal (IDR)</option>
          </Select>
        </FormField>
        <FormField id="promo-value" label="Nilai diskon">
          <Input
            id="promo-value"
            type="number"
            min={0.01}
            step={discountType === "percentage" ? 1 : 1000}
            value={discountValue}
            onChange={(event) => setDiscountValue(event.target.value)}
            required
          />
        </FormField>
        <FormField id="promo-limit" label="Batas penggunaan" className="lg:col-span-2">
          <Input
            id="promo-limit"
            type="number"
            min={1}
            value={usageLimit}
            onChange={(event) => setUsageLimit(event.target.value)}
            placeholder="Kosongkan untuk tidak terbatas"
          />
        </FormField>
        <div className="lg:col-span-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Tambah kode promo
          </Button>
        </div>
      </form>

      <div className="mt-6">
        {promoCodesQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : promoCodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada kode promo untuk event ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Kode</th>
                  <th className="pb-2 pr-3 font-medium">Diskon</th>
                  <th className="pb-2 pr-3 font-medium">Penggunaan</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {promoCodes.map((promo) => (
                  <tr key={promo.id}>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Percent className="size-4 text-brand" />
                        {promo.code}
                      </div>
                      {promo.description ? (
                        <p className="mt-1 text-xs text-muted-foreground">{promo.description}</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">
                      {formatDiscount(promo.discount_type, promo.discount_value)}
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">
                      {promo.usage_count}
                      {promo.usage_limit ? ` / ${promo.usage_limit}` : ""}
                    </td>
                    <td className="py-3">
                      <Badge variant={promo.is_active ? "success" : "secondary"}>
                        {promo.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FormSectionCard>
  );
}
