"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    FormSectionCard,
    FormTabButton,
} from "@/components/features/events/event-management-ui";
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

type TicketTab = "upcoming" | "past";
type TicketFilter = "all" | "valid" | "used";

function MyTicketsSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-sm"
                >
                    <div className="flex flex-col gap-4 lg:flex-row">
                        <Skeleton className="h-28 w-full rounded-2xl lg:w-40" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-28" />
                                <Skeleton className="h-9 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function MyTicketsPanel() {
    const user = useAuthStore((s) => s.user);
    const [tab, setTab] = useState<TicketTab>("upcoming");
    const [filter, setFilter] = useState<TicketFilter>("all");
    const [search, setSearch] = useState("");
    const [selectedTicket, setSelectedTicket] = useState<PersonalTicket | null>(
        null,
    );
    const { data, isLoading, isError, refetch } = useMyOrdersQuery(1, 100);

    const tickets = useMemo(
        () => extractPersonalTickets(data?.data ?? []),
        [data?.data],
    );

    const upcomingTickets = useMemo(
        () => tickets.filter(isActiveTicket),
        [tickets],
    );
    const pastTickets = useMemo(
        () => tickets.filter(isCompletedTicket),
        [tickets],
    );
    const tabTickets = tab === "upcoming" ? upcomingTickets : pastTickets;

    const visibleTickets = useMemo(() => {
        const query = search.trim().toLowerCase();
        return tabTickets.filter((ticket) => {
            const matchesFilter =
                filter === "all"
                    ? true
                    : filter === "valid"
                      ? isActiveTicket(ticket)
                      : isCompletedTicket(ticket);
            if (!matchesFilter) return false;
            if (!query) return true;

            return (
                ticket.event.title.toLowerCase().includes(query) ||
                ticket.ticketCode.toLowerCase().includes(query) ||
                (ticket.ticketTypeName ?? "").toLowerCase().includes(query)
            );
        });
    }, [filter, search, tabTickets]);

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
            <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-brand-muted/70 via-background to-background p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border/70">
                            <CalendarClock className="size-3.5 text-brand" />
                            Semua e-ticket Anda dalam satu tempat
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                My Tickets
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Daftar tiket yang terdaftar sesuai dengan email akun
                            Anda.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
                        <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
                            <p className="text-xs text-muted-foreground">
                                Upcoming
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {upcomingTickets.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
                            <p className="text-xs text-muted-foreground">
                                Past
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {pastTickets.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
                            <p className="text-xs text-muted-foreground">
                                Total
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {tickets.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
                        <FormTabButton
                            active={tab === "upcoming"}
                            onClick={() => setTab("upcoming")}
                        >
                            Upcoming Events
                        </FormTabButton>
                        <FormTabButton
                            active={tab === "past"}
                            onClick={() => setTab("past")}
                        >
                            Past Events
                        </FormTabButton>
                    </div>

                    <div className="relative w-full lg:max-w-sm">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                        />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari event, tipe tiket, atau kode tiket..."
                            className="h-11 pl-9"
                        />
                    </div>
                </div>

                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
                    <FormTabButton
                        active={filter === "all"}
                        onClick={() => setFilter("all")}
                    >
                        Semua
                    </FormTabButton>
                    <FormTabButton
                        active={filter === "valid"}
                        onClick={() => setFilter("valid")}
                    >
                        Valid
                    </FormTabButton>
                    <FormTabButton
                        active={filter === "used"}
                        onClick={() => setFilter("used")}
                    >
                        Sudah digunakan
                    </FormTabButton>
                </div>
            </div>

            {isLoading ? <MyTicketsSkeleton /> : null}

            {isError ? (
                <FormSectionCard title="Gagal memuat tiket">
                    <div className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Terjadi kesalahan saat memuat daftar tiket Anda.
                        </p>
                        <Button variant="outline" onClick={() => refetch()}>
                            Coba lagi
                        </Button>
                    </div>
                </FormSectionCard>
            ) : null}

            {!isLoading && !isError && tickets.length === 0 ? (
                <FormSectionCard title="Belum ada tiket">
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                            <Ticket className="size-7" aria-hidden />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">
                                Tiket Anda akan muncul di sini
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Setelah pembayaran selesai, e-ticket akan
                                tersedia lengkap dengan QR code.
                            </p>
                        </div>
                        <Button
                            className="bg-brand hover:bg-brand-hover"
                            asChild
                        >
                            <Link href={routes.home}>Jelajahi event</Link>
                        </Button>
                    </div>
                </FormSectionCard>
            ) : null}

            {!isLoading &&
            !isError &&
            tickets.length > 0 &&
            visibleTickets.length === 0 ? (
                <FormSectionCard title="Tidak ada tiket yang cocok">
                    <div className="py-6 text-center">
                        <p className="font-medium">
                            {tab === "upcoming"
                                ? "Tidak ada tiket upcoming"
                                : "Tidak ada tiket past"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Coba ubah pencarian atau filter status untuk melihat
                            tiket lainnya.
                        </p>
                    </div>
                </FormSectionCard>
            ) : null}

            {!isLoading && !isError && visibleTickets.length > 0 ? (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {visibleTickets.length} tiket ditemukan
                    </p>
                    <div className="grid gap-4">
                        {visibleTickets.map((ticket) => (
                            <PersonalTicketCard
                                key={ticket.ticketUuid}
                                ticket={ticket}
                                onOpenETicket={setSelectedTicket}
                            />
                        ))}
                    </div>
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
