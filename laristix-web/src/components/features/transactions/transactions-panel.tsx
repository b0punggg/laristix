"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { routes } from "@/config/env";
import { useMyOrdersQuery } from "@/hooks/use-my-orders";
import {
  matchesTransactionFilter,
  transactionFilterOptions,
  type TransactionFilter,
} from "@/lib/transactions";
import { TransactionCard } from "./transaction-card";

export function TransactionsPanel() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const { data, isLoading, isError, refetch } = useMyOrdersQuery(1, 100);

  const orders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (data?.data ?? [])
      .filter((order) => matchesTransactionFilter(order, filter))
      .filter((order) => {
        if (!query) {
          return true;
        }

        const title = order.event?.title?.toLowerCase() ?? "";
        const orderNumber = order.order_number.toLowerCase();

        return title.includes(query) || orderNumber.includes(query);
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [data?.data, filter, search]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama event"
            className="pr-10"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as TransactionFilter)}
          className="sm:w-56"
        >
          {transactionFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? <p className="text-muted-foreground">Memuat transaksi...</p> : null}

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium">Gagal memuat transaksi.</p>
          <button
            type="button"
            className="mt-2 text-primary underline-offset-4 hover:underline"
            onClick={() => refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">Tidak ada transaksi ditemukan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || filter !== "all"
              ? "Coba ubah kata kunci pencarian atau filter status."
              : "Transaksi Anda akan muncul di sini setelah checkout."}
          </p>
          {!search && filter === "all" ? (
            <Button className="mt-4" asChild>
              <Link href={routes.home}>Jelajahi event</Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <TransactionCard key={order.uuid} order={order} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
