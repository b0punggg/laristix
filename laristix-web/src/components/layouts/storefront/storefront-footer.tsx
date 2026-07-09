import Link from "next/link";
import { AppLogo } from "@/components/common/app-logo";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";

const footerColumns = [
  {
    title: "Laristix",
    links: [
      { label: "Tentang Kami", href: routes.about },
      { label: "Biaya", href: routes.pricing },
      { label: "Syarat & Ketentuan", href: routes.terms },
      { label: "Kebijakan Privasi", href: routes.privacy },
    ],
  },
  {
    title: "Layanan",
    links: [
      { label: "Jelajahi Event", href: routes.home },
      { label: "Buat Event", href: routes.buatEvent },
      { label: "Tiket Saya", href: routes.myTickets },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { label: "Customer Service", href: "#dukungan" },
      { label: "FAQ", href: routes.faq },
      { label: "Partnership", href: routes.createOrganizer },
    ],
  },
  {
    title: "Organizer",
    links: [
      { label: "Daftar Organizer", href: routes.createOrganizer },
      { label: "Dashboard", href: routes.login },
      { label: "Panduan Event", href: routes.buatEvent },
    ],
  },
] as const;

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "X / Twitter", href: "#" },
  { label: "TikTok", href: "#" },
] as const;

export function StorefrontFooter() {
  return (
    <footer id="dukungan" className="mt-auto border-t bg-surface">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <AppLogo variant="storefront" />
            <Text variant="caption" className="mt-4 max-w-xs leading-relaxed">
              Platform tiket event terpercaya di Indonesia. Temukan pengalaman terbaik dan kelola eventmu dengan mudah.
            </Text>
            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="ds-focus-ring rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand/30 hover:text-brand"
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-bold text-foreground">{column.title}</h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Laristix. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Pembayaran aman oleh Midtrans · QRIS · GoPay · ShopeePay
          </p>
        </div>
      </Container>
    </footer>
  );
}
