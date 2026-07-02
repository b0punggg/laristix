"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateOrganizerFeeConfigMutation,
  useDeleteOrganizerFeeConfigMutation,
  useOrganizerFeeConfigsQuery,
} from "@/hooks/use-admin-settings";
import type { FeeBearer, FeeType, StoreOrganizerFeeConfigPayload } from "@/types/admin";

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toLocalDatetimeInput(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

interface AdminOrganizerFeePanelProps {
  organizerUuid: string;
}

export function AdminOrganizerFeePanel({ organizerUuid }: AdminOrganizerFeePanelProps) {
  const { data: configs = [], isLoading, isError, refetch } = useOrganizerFeeConfigsQuery(
    organizerUuid,
  );
  const createConfig = useCreateOrganizerFeeConfigMutation(organizerUuid);
  const deleteConfig = useDeleteOrganizerFeeConfigMutation(organizerUuid);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<StoreOrganizerFeeConfigPayload>({
    fee_type: "percentage",
    percentage_rate: 5,
    flat_amount: 0,
    fee_bearer: "attendee",
    effective_from: toLocalDatetimeInput(new Date()),
    effective_until: null,
    notes: "",
  });

  function handleCreate() {
    createConfig.mutate(
      {
        ...form,
        notes: form.notes?.trim() || null,
        effective_until: form.effective_until || null,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({
            fee_type: "percentage",
            percentage_rate: 5,
            flat_amount: 0,
            fee_bearer: "attendee",
            effective_from: toLocalDatetimeInput(new Date()),
            effective_until: null,
            notes: "",
          });
        },
      },
    );
  }

  function handleDelete(id: number, effectiveFrom: string) {
    if (!window.confirm(`Delete fee config effective from ${formatDate(effectiveFrom)}?`)) {
      return;
    }

    deleteConfig.mutate(id);
  }

  const isFuture = (value: string) => new Date(value) > new Date();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Fee configuration</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Organizer-specific fees override the platform default.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="mr-2 size-4" />
          {showForm ? "Cancel" : "Add config"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm ? (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fee type</Label>
                <Select
                  value={form.fee_type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fee_type: e.target.value as FeeType }))
                  }
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                  <option value="both">Both</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fee bearer</Label>
                <Select
                  value={form.fee_bearer}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fee_bearer: e.target.value as FeeBearer }))
                  }
                >
                  <option value="attendee">Attendee</option>
                  <option value="organizer">Organizer</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Percentage rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.percentage_rate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, percentage_rate: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Flat amount (IDR)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.flat_amount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, flat_amount: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Effective from</Label>
                <Input
                  type="datetime-local"
                  value={form.effective_from}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, effective_from: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Effective until (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.effective_until ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      effective_until: e.target.value || null,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
            <Button onClick={handleCreate} disabled={createConfig.isPending}>
              {createConfig.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Create fee config
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading fee configs...</p>
        ) : null}

        {isError ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Failed to load fee configs.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && configs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No custom fee config — platform default fee applies.
          </p>
        ) : null}

        {!isLoading && !isError && configs.length > 0 ? (
          <div className="space-y-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="space-y-1 text-sm">
                  <p className="font-medium capitalize">
                    {config.fee_type} · {config.fee_bearer}
                  </p>
                  <p className="text-muted-foreground">
                    {config.percentage_rate}% + Rp {config.flat_amount.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(config.effective_from)} → {formatDate(config.effective_until)}
                  </p>
                  {config.notes ? (
                    <p className="text-xs text-muted-foreground">{config.notes}</p>
                  ) : null}
                </div>
                {isFuture(config.effective_from) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleteConfig.isPending}
                    onClick={() => handleDelete(config.id, config.effective_from)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Active / past</span>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
