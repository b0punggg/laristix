"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { routes } from "@/config/env";
import { formatCurrency } from "@/lib/currency";
import type { TicketType } from "@/types/ticket";

export function getPurchasableTickets(tickets: TicketType[]) {
  return tickets.filter((ticket) => ticket.is_purchasable);
}

export function getTicketAvailabilityLabel(ticket: TicketType) {
  if (ticket.is_sold_out) return "Habis";
  if (!ticket.is_sales_open) return "Penjualan ditutup";
  if (ticket.is_purchasable) return "Tersedia";
  return "Tidak tersedia";
}

export function useEventPurchaseSelection(
  tickets: TicketType[],
  eventUuid: string,
  currentUser: { id: number } | null | undefined,
) {
  const purchasableTickets = useMemo(() => getPurchasableTickets(tickets), [tickets]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedTicket = useMemo(
    () => purchasableTickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [purchasableTickets, selectedTicketId],
  );

  useEffect(() => {
    if (purchasableTickets.length === 0) {
      setSelectedTicketId(null);
      return;
    }

    setSelectedTicketId((current) => {
      if (current && purchasableTickets.some((ticket) => ticket.id === current)) {
        return current;
      }
      return purchasableTickets[0]?.id ?? null;
    });
  }, [purchasableTickets]);

  useEffect(() => {
    if (selectedTicket) {
      setQuantity(selectedTicket.min_per_order);
    }
  }, [selectedTicket]);

  const maxQuantity = selectedTicket
    ? Math.min(selectedTicket.max_per_order, selectedTicket.available_quantity)
    : 1;

  const minQuantity = selectedTicket?.min_per_order ?? 1;

  const incrementQuantity = useCallback(() => {
    setQuantity((current) => Math.min(maxQuantity, current + 1));
  }, [maxQuantity]);

  const decrementQuantity = useCallback(() => {
    setQuantity((current) => Math.max(minQuantity, current - 1));
  }, [minQuantity]);

  const subtotal = selectedTicket
    ? selectedTicket.is_free
      ? 0
      : selectedTicket.price * quantity
    : null;

  const subtotalLabel =
    subtotal === null
      ? null
      : selectedTicket?.is_free
        ? "Gratis"
        : formatCurrency(subtotal, selectedTicket?.currency);

  const checkoutHref = selectedTicket
    ? routes.publicEventCheckout(eventUuid, selectedTicket.id, quantity)
    : null;

  const resolvedCheckoutHref = checkoutHref
    ? currentUser
      ? checkoutHref
      : routes.loginWithRedirect(checkoutHref)
    : null;

  const ctaDisabled = !selectedTicket;
  const ctaLabel = !selectedTicket
    ? tickets.length === 0
      ? "Tiket belum tersedia"
      : tickets.every((ticket) => ticket.is_sold_out)
        ? "Tiket habis"
        : "Tiket tidak tersedia"
    : currentUser
      ? "Beli Tiket"
      : "Masuk untuk beli";

  return {
    purchasableTickets,
    selectedTicket,
    selectedTicketId,
    setSelectedTicketId,
    quantity,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    minQuantity,
    maxQuantity,
    subtotalLabel,
    checkoutHref: resolvedCheckoutHref,
    ctaLabel,
    ctaDisabled,
  };
}
