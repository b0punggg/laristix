"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TicketKindBadge } from "@/components/features/tickets/ticket-kind-badge";
import { routes } from "@/config/env";
import { usePublicEventQuery, usePublicTicketsQuery } from "@/hooks/use-public-events";
import { useCheckoutMutation } from "@/hooks/use-checkout";
import { useMeQuery } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/currency";
import { useMidtransSnap } from "./use-midtrans-snap";

interface CheckoutPanelProps {
  eventUuid: string;
  ticketTypeId: number;
}

export function CheckoutPanel({ eventUuid, ticketTypeId }: CheckoutPanelProps) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const storedUser = useAuthStore((s) => s.user);
  const { data: me } = useMeQuery(isHydrated);
  const currentUser = me ?? storedUser;

  const eventQuery = usePublicEventQuery(eventUuid);
  const ticketsQuery = usePublicTicketsQuery(eventUuid);
  const checkoutMutation = useCheckoutMutation(eventUuid);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [orderUuid, setOrderUuid] = useState<string | null>(null);

  const ticket = useMemo(
    () => ticketsQuery.data?.find((t) => t.id === ticketTypeId),
    [ticketsQuery.data, ticketTypeId],
  );

  const total = ticket ? ticket.price * quantity : 0;

  useMidtransSnap({
    snapToken: snapToken ?? "",
    clientKey,
    onSuccess: () => {
      if (orderUuid) {
        router.push(routes.checkoutFinish(orderUuid));
      }
    },
    onPending: () => {
      if (orderUuid) {
        router.push(routes.checkoutFinish(orderUuid));
      }
    },
    onError: () => {
      if (orderUuid) {
        router.push(routes.checkoutFinish(orderUuid));
      }
    },
  });

  useEffect(() => {
    if (ticket) {
      setQuantity(ticket.min_per_order);
    }
  }, [ticket]);

  useEffect(() => {
    if (currentUser) {
      setBuyerName(currentUser.name);
      setBuyerEmail(currentUser.email);
      setBuyerPhone(currentUser.phone ?? "");
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    checkoutMutation.mutate(
      {
        ticket_type_id: ticketTypeId,
        quantity,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone || undefined,
      },
      {
        onSuccess: (data) => {
          setOrderUuid(data.order.uuid);

          if (data.order.status === "completed") {
            router.push(routes.checkoutFinish(data.order.uuid));
            return;
          }

          if (data.snap_token) {
            setSnapToken(data.snap_token);
            setClientKey(data.client_key);
          }
        },
      },
    );
  };

  if (eventQuery.isLoading || ticketsQuery.isLoading) {
    return <p className="text-muted-foreground">Memuat checkout...</p>;
  }

  if (!ticket || !ticket.is_purchasable) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href={routes.publicEvent(eventUuid)}>
            <ArrowLeft className="size-4" />
            Kembali ke event
          </Link>
        </Button>
        <p className="text-destructive">Tiket tidak tersedia untuk dibeli.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href={routes.publicEvent(eventUuid)}>
          <ArrowLeft className="size-4" />
          Kembali ke event
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">{eventQuery.data?.title}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{ticket.name}</CardTitle>
            <TicketKindBadge kind={ticket.kind} />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {ticket.is_free
            ? "Gratis"
            : `${formatCurrency(ticket.price, ticket.currency)} × ${quantity} = ${formatCurrency(total, ticket.currency)}`}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Jumlah tiket</Label>
          <Input
            id="quantity"
            type="number"
            min={ticket.min_per_order}
            max={ticket.max_per_order}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Min {ticket.min_per_order}, maks {ticket.max_per_order}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer_name">Nama lengkap</Label>
          <Input
            id="buyer_name"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer_email">Email</Label>
          <Input
            id="buyer_email"
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer_phone">No. telepon (opsional)</Label>
          <Input
            id="buyer_phone"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={checkoutMutation.isPending || Boolean(snapToken)}>
          {checkoutMutation.isPending
            ? "Memproses..."
            : snapToken
              ? "Menunggu pembayaran..."
              : ticket.is_free
                ? "Konfirmasi tiket gratis"
                : "Lanjut ke pembayaran"}
        </Button>
      </form>
    </div>
  );
}
