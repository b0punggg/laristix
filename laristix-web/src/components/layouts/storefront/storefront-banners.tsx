import { Instagram, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/env";

export function StorefrontBanners() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-2">
      <Link
        href={routes.createOrganizer}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e4fd6] via-[#2563eb] to-[#3b82f6] p-6 text-white shadow-md transition-transform hover:scale-[1.01] sm:p-8"
      >
        <div className="relative z-10 max-w-[85%] space-y-3">
          <p className="inline-flex items-center gap-1 text-sm font-medium text-blue-100">
            <Zap className="size-4" />
            Platform event & tiket
          </p>
          <h2 className="text-2xl font-extrabold leading-tight drop-shadow-sm sm:text-3xl">
            Kelola Event & Jual Tiket dengan Mudah
          </h2>
          <p className="text-sm text-blue-100 sm:text-base">
            Buat event, atur tiket, dan terima pembayaran — semua dalam satu platform.
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="size-3.5" />
            Mulai gratis
          </span>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 size-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-2 top-4 text-6xl opacity-20">🎫</div>
      </Link>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e4fd6] via-[#1d4ed8] to-[#2563eb] p-6 text-white shadow-md sm:p-8">
        <div className="relative z-10 max-w-[85%] space-y-3">
          <p className="inline-flex items-center gap-1 text-sm font-medium text-blue-100">
            <Instagram className="size-4" />
            Ikuti kami
          </p>
          <h2 className="text-2xl font-extrabold leading-tight drop-shadow-sm sm:text-3xl">
            Temukan Event Terbaru
          </h2>
          <p className="text-sm text-blue-100 sm:text-base">
            Jelajahi konser, festival, workshop, dan acara menarik lainnya di Laristix.
          </p>
          <p className="text-xs font-medium text-blue-200">@laristix</p>
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 flex gap-2 text-2xl opacity-80">
          <span>📱</span>
          <span>🔔</span>
        </div>
        <div className="pointer-events-none absolute -bottom-8 -left-8 size-36 rounded-full bg-white/10" />
      </div>
    </section>
  );
}
