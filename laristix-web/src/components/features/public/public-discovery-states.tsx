import { CalendarSearch, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicEmptyEventsStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function PublicEmptyEventsState({ hasFilters, onClearFilters }: PublicEmptyEventsStateProps) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <CalendarSearch className="size-7 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold text-foreground">
        {hasFilters ? "Tidak ada event yang cocok" : "Belum ada event dipublikasikan"}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Coba ubah kategori, kota, atau kata kunci pencarian. Anda juga bisa hapus semua filter."
          : "Event akan muncul di sini setelah organizer mempublikasikannya."}
      </p>
      {hasFilters && onClearFilters ? (
        <Button variant="outline" className="mt-6" onClick={onClearFilters}>
          Hapus semua filter
        </Button>
      ) : null}
    </div>
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
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <RefreshCw className="size-5 text-destructive" />
      </div>
      <p className="font-medium text-foreground">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Periksa koneksi internet Anda lalu coba lagi.
      </p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  );
}
