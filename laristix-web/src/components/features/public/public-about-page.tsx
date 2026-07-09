import Link from "next/link";
import { ArrowRight, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHomeHowItWorksSection } from "@/components/features/public/public-home-how-it-works";
import { PublicHomeStatsSection } from "@/components/features/public/public-home-stats-section";
import { PublicHomeWhySection } from "@/components/features/public/public-home-why-section";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";

const values = [
  {
    icon: Target,
    title: "Misi Kami",
    description:
      "Memudahkan setiap orang menemukan dan menikmati event terbaik di Indonesia, sekaligus memberdayakan organizer untuk mengelola acara secara profesional.",
  },
  {
    icon: Sparkles,
    title: "Visi Kami",
    description:
      "Menjadi platform tiket event pilihan utama yang menghubungkan jutaan peserta dengan pengalaman live yang berkesan.",
  },
] as const;

export function PublicAboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-deep via-brand to-brand-light text-white">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-20 -left-20 size-56 rounded-full bg-brand-light/20 blur-2xl" aria-hidden />
        <Container className="relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Text variant="overline" className="text-white/70">
              Tentang Kami
            </Text>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Your Professional Ticketing Partner
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/85">
              Laristix adalah platform tiket event terpercaya di Indonesia. Kami membantu peserta
              menemukan event favorit dan mendukung organizer mengelola penjualan tiket hingga
              check-in di lokasi.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-brand hover:bg-white/90"
              >
                <Link href={routes.home}>
                  Jelajahi Event
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href={routes.createOrganizer}>Jadi Organizer</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-20">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Text variant="h2">Siapa Kami</Text>
            <Text variant="body-md" color="muted" className="mt-3">
              Dibangun untuk ekosistem event Indonesia — dari konser dan festival hingga seminar
              dan pameran. Laristix menghadirkan pengalaman pembelian tiket yang aman, cepat, dan
              nyaman bagi peserta, serta alat manajemen yang praktis bagi penyelenggara acara.
            </Text>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border bg-card p-8 shadow-sm"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <Text variant="h3">{item.title}</Text>
                  <Text variant="body-md" color="muted" className="mt-3 leading-relaxed">
                    {item.description}
                  </Text>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <PublicHomeWhySection />
      <PublicHomeHowItWorksSection />
      <PublicHomeStatsSection />

      <section className="border-t bg-surface py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Text variant="h2">Siap bergabung dengan Laristix?</Text>
            <Text variant="caption" className="mt-2">
              Temukan event menarik atau mulai jual tiket acaramu hari ini.
            </Text>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-brand hover:bg-brand-hover">
                <Link href={routes.home}>Lihat Event</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.createOrganizer}>Daftarkan Eventmu</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
