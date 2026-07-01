import Link from "next/link";
import { routes } from "@/config/env";

const footerColumns = [
  {
    title: "Laristix",
    links: [
      { label: "Tentang Kami", href: "#tentang" },
      { label: "Syarat & Ketentuan", href: "#" },
      { label: "Kebijakan Privasi", href: "#" },
    ],
  },
  {
    title: "Layanan Kami",
    links: [
      { label: "Ticket Management System", href: routes.createOrganizer },
      { label: "Kelola Event", href: routes.createOrganizer },
      { label: "Pembayaran Online", href: routes.home },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { label: "Customer Service", href: "#dukungan" },
      { label: "Partnership", href: routes.createOrganizer },
    ],
  },
  {
    title: "Lainnya",
    links: [
      { label: "Cara Membeli Tiket", href: routes.home },
      { label: "Daftar Event", href: routes.createOrganizer },
    ],
  },
] as const;

const socialLinks = [
  { label: "Instagram", href: "#", className: "bg-gradient-to-br from-pink-500 to-purple-600" },
  { label: "Youtube", href: "#", className: "bg-red-600" },
  { label: "X", href: "#", className: "bg-gray-900" },
  { label: "Tiktok", href: "#", className: "bg-gray-900" },
] as const;

export function StorefrontFooter() {
  return (
    <footer id="dukungan" className="mt-auto border-t bg-[#f5f6f8]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-bold text-gray-900">{column.title}</h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-[#1e4fd6]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-4 text-sm font-bold text-gray-900">Ikuti Kami</h3>
            <div className="grid grid-cols-2 gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 ${social.className}`}
                >
                  <span>{social.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Laristix © {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
