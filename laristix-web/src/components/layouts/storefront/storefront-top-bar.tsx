import Link from "next/link";
import { routes } from "@/config/env";

const topLinks = [
  { label: "Tentang Kami", href: "#tentang" },
  { label: "Customer Service", href: "#dukungan" },
] as const;

export function StorefrontTopBar() {
  return (
    <div className="bg-[#1e4fd6] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:text-sm">
        <Link
          href={routes.createOrganizer}
          className="font-medium transition-opacity hover:opacity-90"
        >
          + Daftarkan Eventmu Sekarang
        </Link>
        <nav className="hidden items-center gap-5 sm:flex">
          {topLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-90">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
