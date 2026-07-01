"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/env";
import { useEventQuery } from "@/hooks/use-events";
import {
  useCreateTicketMutation,
  useTicketTypeQuery,
  useUpdateTicketMutation,
} from "@/hooks/use-tickets";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime";
import { canManageEvents } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { TicketKind, TicketType } from "@/types/ticket";
import { TicketActions } from "./ticket-actions";
import { TicketKindBadge } from "./ticket-kind-badge";
import { TicketStatusBadge } from "./ticket-status-badge";

const schema = z
  .object({
    kind: z.enum(["free", "paid", "vip"]),
    name: z.string().max(255).optional(),
    description: z.string().optional(),
    price: z.string().optional(),
    quantity: z.string().min(1, "Quota is required."),
    min_per_order: z.string().optional(),
    max_per_order: z.string().optional(),
    sales_start_at: z.string().optional(),
    sales_end_at: z.string().optional(),
    visibility: z.enum(["public", "hidden", "invite_only"]),
    status: z.enum(["active", "sold_out", "hidden", "archived"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind !== "free") {
      const price = Number(data.price);
      if (!data.price || Number.isNaN(price) || price <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price must be greater than 0 for paid and VIP tickets.",
          path: ["price"],
        });
      }
    }

    if (data.sales_start_at && data.sales_end_at) {
      if (new Date(data.sales_end_at) <= new Date(data.sales_start_at)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sales end must be after sales start.",
          path: ["sales_end_at"],
        });
      }
    }
  });

type TicketFormValues = z.infer<typeof schema>;

const kindOptions: Array<{ value: TicketKind; label: string; hint: string }> = [
  { value: "free", label: "Free Ticket", hint: "No charge — price is always 0." },
  { value: "paid", label: "Paid Ticket", hint: "Standard paid admission." },
  { value: "vip", label: "VIP Ticket", hint: "Premium tier with higher price." },
];

function ticketToFormValues(ticket: TicketType): TicketFormValues {
  return {
    kind: ticket.kind,
    name: ticket.name,
    description: ticket.description ?? "",
    price: ticket.is_free ? "" : String(ticket.price),
    quantity: String(ticket.quantity),
    min_per_order: String(ticket.min_per_order),
    max_per_order: String(ticket.max_per_order),
    sales_start_at: toDatetimeLocalValue(ticket.sales_start_at),
    sales_end_at: toDatetimeLocalValue(ticket.sales_end_at),
    visibility: ticket.visibility,
    status: ticket.status,
  };
}

interface TicketFormProps {
  eventUuid: string;
  mode: "create" | "edit";
  ticketId?: number;
}

export function TicketForm({ eventUuid, mode, ticketId }: TicketFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isEdit = mode === "edit" && ticketId !== undefined;

  const eventQuery = useEventQuery(eventUuid);
  const ticketQuery = useTicketTypeQuery(eventUuid, ticketId ?? 0, Boolean(isEdit));
  const createMutation = useCreateTicketMutation(eventUuid);
  const updateMutation = useUpdateTicketMutation(eventUuid, ticketId ?? 0);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: "paid",
      name: "",
      description: "",
      price: "",
      quantity: "100",
      min_per_order: "1",
      max_per_order: "10",
      sales_start_at: "",
      sales_end_at: "",
      visibility: "public",
    },
  });

  const selectedKind = useWatch({ control, name: "kind" });

  useEffect(() => {
    if (!isEdit && !canManageEvents(user)) {
      router.replace(routes.organizerEventTickets(eventUuid));
    }
  }, [isEdit, user, router, eventUuid]);

  useEffect(() => {
    if (ticketQuery.data) {
      reset(ticketToFormValues(ticketQuery.data));
    }
  }, [ticketQuery.data, reset]);

  const onSubmit = (values: TicketFormValues) => {
    const salesStart = values.sales_start_at
      ? fromDatetimeLocalValue(values.sales_start_at)
      : null;
    const salesEnd = values.sales_end_at ? fromDatetimeLocalValue(values.sales_end_at) : null;
    const effectiveKind = isEdit ? ticket?.kind : values.kind;
    const isFreeKind = effectiveKind === "free";

    if (isEdit) {
      updateMutation.mutate({
        name: values.name || undefined,
        description: values.description || null,
        price: isFreeKind ? 0 : Number(values.price),
        quantity: Number(values.quantity),
        min_per_order: Number(values.min_per_order || 1),
        max_per_order: Number(values.max_per_order || 10),
        sales_start_at: salesStart,
        sales_end_at: salesEnd,
        visibility: values.visibility,
        status: values.status,
      });
      return;
    }

    createMutation.mutate({
      kind: values.kind,
      name: values.name || undefined,
      description: values.description || undefined,
      price: isFreeKind ? 0 : Number(values.price),
      quantity: Number(values.quantity),
      min_per_order: Number(values.min_per_order || 1),
      max_per_order: Number(values.max_per_order || 10),
      sales_start_at: salesStart,
      sales_end_at: salesEnd,
      visibility: values.visibility,
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const event = eventQuery.data;
  const ticket = ticketQuery.data;

  if (isEdit && ticketQuery.isLoading) {
    return <p className="text-muted-foreground">Loading ticket...</p>;
  }

  if (isEdit && ticketQuery.isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Ticket not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.organizerEventTickets(eventUuid)}>
            <ArrowLeft className="size-4" />
            Back to tickets
          </Link>
        </Button>
        {event ? (
          <span className="text-sm text-muted-foreground">{event.title}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEdit ? "Edit ticket" : "Create ticket"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Set ticket kind, quota, price, and sales period.
          </p>
        </div>
        {ticket ? (
          <div className="flex items-center gap-2">
            <TicketKindBadge kind={ticket.kind} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        ) : null}
      </div>

      {ticket ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketActions eventUuid={eventUuid} ticket={ticket} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-lg">Ticket details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEdit ? (
              <div className="space-y-2">
                <Label htmlFor="kind">Ticket kind *</Label>
                <Select id="kind" {...register("kind")}>
                  {kindOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-muted-foreground">
                  {kindOptions.find((o) => o.value === selectedKind)?.hint}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Label>Ticket kind</Label>
                {ticket ? <TicketKindBadge kind={ticket.kind} /> : null}
                <p className="text-xs text-muted-foreground">Kind cannot be changed after creation.</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder={
                    selectedKind === "free"
                      ? "Free Ticket"
                      : selectedKind === "vip"
                        ? "VIP Ticket"
                        : "Paid Ticket"
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} {...register("description")} />
              </div>

              {(isEdit ? ticket?.kind !== "free" : selectedKind !== "free") ? (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (IDR) *</Label>
                  <Input id="price" type="number" min={1} step={1000} {...register("price")} />
                  {errors.price ? (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="quantity">Quota *</Label>
                <Input id="quantity" type="number" min={1} {...register("quantity")} />
                {errors.quantity ? (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select id="visibility" {...register("visibility")}>
                  <option value="public">Public</option>
                  <option value="hidden">Hidden</option>
                  <option value="invite_only">Invite only</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_per_order">Min per order</Label>
                <Input id="min_per_order" type="number" min={1} {...register("min_per_order")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_per_order">Max per order</Label>
                <Input id="max_per_order" type="number" min={1} {...register("max_per_order")} />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4 text-sm font-medium">Sales period</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sales_start_at">Sales start</Label>
                  <Input id="sales_start_at" type="datetime-local" {...register("sales_start_at")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sales_end_at">Sales end</Label>
                  <Input id="sales_end_at" type="datetime-local" {...register("sales_end_at")} />
                  {errors.sales_end_at ? (
                    <p className="text-sm text-destructive">{errors.sales_end_at.message}</p>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Leave empty for no time restriction on that side.
              </p>
            </div>

            {isEdit ? (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" {...register("status")}>
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                  <option value="archived">Archived</option>
                  <option value="sold_out">Sold out</option>
                </Select>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href={routes.organizerEventTickets(eventUuid)}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create ticket"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
