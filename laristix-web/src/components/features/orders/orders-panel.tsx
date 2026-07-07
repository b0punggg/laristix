"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Receipt, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import { routes } from "@/config/env";
import { useMyOrdersQuery } from "@/hooks/use-my-orders";
import { exportOrdersCsv } from "@/lib/orders-export";
import {
  matchesTransactionFilter,
  type TransactionFilter,
} from "@/lib/transactions";
import type { CheckoutOrder } from "@/types/checkout";
import { OrderDetailDrawer } from "./order-detail-drawer";
import { OrderInvoicePreview } from "./order-invoice-preview";
import { OrderRefundDialog } from "./order-refund-dialog";
import { OrdersPagination } from "./orders-pagination";
import { OrdersTable } from "./orders-table";
import { OrdersTableSkeleton } from "./orders-table-skeleton";
import { OrdersToolbar } from "./orders-toolbar";

const PAGE_SIZE = 10;
const FETCH_PER_PAGE = 100;

export function OrdersPanel() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [page, setPage] = useState(1);

  const [selectedOrderUuid, setSelectedOrderUuid] = useState<string | null>(null);
  const [selectedOrderSummary, setSelectedOrderSummary] = useState<CheckoutOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [invoiceOrder, setInvoiceOrder] = useState<CheckoutOrder | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const [refundOrder, setRefundOrder] = useState<CheckoutOrder | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useMyOrdersQuery(1, FETCH_PER_PAGE);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (data?.data ?? [])
      .filter((order) => matchesTransactionFilter(order, filter))
      .filter((order) => {
        if (!query) return true;

        const title = order.event?.title?.toLowerCase() ?? "";
        const orderNumber = order.order_number.toLowerCase();
        const buyer = order.buyer_name.toLowerCase();

        return (
          title.includes(query) || orderNumber.includes(query) || buyer.includes(query)
        );
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [data?.data, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredOrders]);

  function openDetail(order: CheckoutOrder) {
    setSelectedOrderUuid(order.uuid);
    setSelectedOrderSummary(order);
    setDrawerOpen(true);
  }

  function openInvoice(order: CheckoutOrder) {
    setInvoiceOrder(order);
    setInvoiceOpen(true);
  }

  function openRefund(order: CheckoutOrder) {
    setRefundOrder(order);
    setRefundOpen(true);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleFilterChange(value: TransactionFilter) {
    setFilter(value);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transaksi</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Kelola riwayat pembelian tiket, lihat invoice, dan ajukan refund.
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-muted text-brand">
          <Receipt className="size-6" aria-hidden />
        </div>
      </div>

      <OrdersToolbar
        search={search}
        onSearchChange={handleSearchChange}
        filter={filter}
        onFilterChange={handleFilterChange}
        onExport={() => exportOrdersCsv(filteredOrders)}
        exportDisabled={filteredOrders.length === 0}
        totalCount={filteredOrders.length}
      />

      {isLoading ? <OrdersTableSkeleton /> : null}

      {isError ? (
        <FormSectionCard title="Gagal memuat transaksi">
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Terjadi kesalahan saat memuat daftar transaksi.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        </FormSectionCard>
      ) : null}

      {!isLoading && !isError && filteredOrders.length === 0 ? (
        <FormSectionCard title="Tidak ada transaksi">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand">
              <ShoppingBag className="size-7" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="font-medium">
                {search || filter !== "all"
                  ? "Tidak ada transaksi yang cocok"
                  : "Belum ada transaksi"}
              </p>
              <p className="text-sm text-muted-foreground">
                {search || filter !== "all"
                  ? "Coba ubah kata kunci pencarian atau filter status."
                  : "Transaksi Anda akan muncul di sini setelah checkout."}
              </p>
            </div>
            {!search && filter === "all" ? (
              <Button asChild className="bg-brand hover:bg-brand-hover">
                <Link href={routes.home}>Jelajahi event</Link>
              </Button>
            ) : null}
          </div>
        </FormSectionCard>
      ) : null}

      {!isLoading && !isError && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          <OrdersTable
            orders={paginatedOrders}
            onViewDetail={openDetail}
            onPreviewInvoice={openInvoice}
            onRequestRefund={openRefund}
          />

          <OrdersPagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      <OrderDetailDrawer
        orderUuid={selectedOrderUuid}
        summary={selectedOrderSummary}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onPreviewInvoice={(order) => {
          setDrawerOpen(false);
          openInvoice(order);
        }}
        onRequestRefund={(order) => {
          setDrawerOpen(false);
          openRefund(order);
        }}
      />

      <OrderInvoicePreview
        order={invoiceOrder}
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
      />

      <OrderRefundDialog order={refundOrder} open={refundOpen} onOpenChange={setRefundOpen} />
    </div>
  );
}
