import Link from "next/link";
import { ArrowRight, CalendarPlus, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";

const perks = [
  { icon: CalendarPlus, label: "Buat event dalam menit" },
  { icon: TrendingUp, label: "Dashboard analitik real-time" },
  { icon: Users, label: "Kelola tim & check-in" },
] as const;

export function PublicHomeOrganizerCtaSection() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-deep via-brand to-brand-light px-6 py-12 text-white shadow-xl sm:px-10 sm:py-16 md:px-16">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-brand-light/20 blur-2xl" aria-hidden />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <Text variant="overline" className="text-white/70">
                Untuk Organizer
              </Text>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Punya event? Jual tiketnya di Laristix
              </h2>
              <p className="max-w-md text-base leading-relaxed text-white/80">
                Platform lengkap untuk membuat, mempromosikan, dan mengelola eventmu — dari penjualan tiket hingga check-in peserta.
              </p>
              <div className="flex flex-wrap gap-4">
                {perks.map((perk) => {
                  const Icon = perk.icon;
                  return (
                    <span
                      key={perk.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm"
                    >
                      <Icon className="size-4" aria-hidden />
                      {perk.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <Button asChild size="lg" className="bg-white text-brand shadow-lg hover:bg-brand-muted">
                <Link href={routes.createOrganizer}>
                  Daftar sebagai Organizer
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <p className="text-sm text-white/60">Gratis untuk memulai · Tanpa biaya bulanan</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
