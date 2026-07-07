import { CalendarSearch, RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DsEmptyState } from "@/design-system/components/states/empty-state";

interface PublicEmptyEventsStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function PublicEmptyEventsState({ hasFilters, onClearFilters }: PublicEmptyEventsStateProps) {
  return (
    <DsEmptyState
      icon={hasFilters ? SearchX : CalendarSearch}
      title={hasFilters ? "Tidak ada event yang cocok" : "Belum ada event dipublikasikan"}
      description={
        hasFilters
          ? "Coba ubah kategori, lokasi, tanggal, atau kata kunci pencarian. Anda juga bisa hapus semua filter."
          : "Event akan muncul di sini setelah organizer mempublikasikannya."
      }
      className="py-16"
    >
      {hasFilters && onClearFilters ? (
        <Button variant="outline" onClick={onClearFilters}>
          Hapus semua filter
        </Button>
      ) : null}
    </DsEmptyState>
  );
}

interface PublicDiscoveryErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function PublicDiscoveryErrorState({
  message = "Gagal memuat event.",
  onRetry,
}: PublicDiscoveryErrorStateProps) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <RefreshCw className="size-6 text-destructive" aria-hidden />
      </div>
      <p className="text-lg font-semibold text-foreground">{message}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Periksa koneksi internet Anda lalu coba lagi.
      </p>
      <Button variant="outline" className="mt-6" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  );
}
