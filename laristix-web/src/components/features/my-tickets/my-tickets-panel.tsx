"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/env";
import { useMyOrdersQuery } from "@/hooks/use-my-orders";
import {
  extractPersonalTickets,
  isActiveTicket,
  isCompletedTicket,
  type PersonalTicket,
} from "@/lib/my-tickets";
import { useAuthStore } from "@/stores/auth-store";
import { ETicketModal, PersonalTicketCard } from "./personal-ticket-card";

type TicketTab = "active" | "completed";

export function MyTicketsPanel() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<TicketTab>("active");
  const [selectedTicket, setSelectedTicket] = useState<PersonalTicket | null>(null);
  const { data, isLoading, isError, refetch } = useMyOrdersQuery(1, 100);

  const tickets = useMemo(() => extractPersonalTickets(data?.data ?? []), [data?.data]);

  const activeTickets = useMemo(() => tickets.filter(isActiveTicket), [tickets]);
  const completedTickets = useMemo(() => tickets.filter(isCompletedTicket), [tickets]);
  const visibleTickets = tab === "active" ? activeTickets : completedTickets;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tiket Personal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar tiket yang terdaftar sesuai dengan email akun
          {user?.email ? ` ${user.email}` : ""}.
        </p>
      </div>

      <div className="flex gap-6 border-b">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
            tab === "active"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Event Aktif
        </button>
        <button
          type="button"
          onClick={() => setTab("completed")}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
            tab === "completed"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Event Selesai
        </button>
      </div>

      {isLoading ? <p className="text-muted-foreground">Memuat tiket...</p> : null}

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium">Gagal memuat tiket.</p>
          <button
            type="button"
            className="mt-2 text-primary underline-offset-4 hover:underline"
            onClick={() => refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Ticket className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">Belum ada tiket</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tiket Anda akan muncul di sini setelah pembayaran selesai.
          </p>
          <Button className="mt-4" asChild>
            <Link href={routes.home}>Jelajahi event</Link>
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && tickets.length > 0 && visibleTickets.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">
            {tab === "active" ? "Tidak ada tiket aktif" : "Belum ada tiket yang sudah discan"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "active"
              ? "Semua tiket Anda sudah digunakan untuk check-in."
              : "Tiket yang sudah discan akan muncul di sini."}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && visibleTickets.length > 0 ? (
        <div className="space-y-4">
          {visibleTickets.map((ticket) => (
            <PersonalTicketCard
              key={ticket.ticketUuid}
              ticket={ticket}
              onOpenETicket={setSelectedTicket}
            />
          ))}
          <p className="pt-2 text-center text-sm text-muted-foreground">
            Anda telah melihat semua tiket.
          </p>
        </div>
      ) : null}

      <ETicketModal
        ticket={selectedTicket}
        open={selectedTicket !== null}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
}
