"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateEventCtaButton } from "@/components/features/public/create-event-cta-button";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";
import {
  createEventFaqItems,
  createEventHeroPerks,
  createEventPaymentMethods,
  createEventPlatformBenefits,
  createEventSteps,
  offlineEventFeatures,
  onlineEventFeatures,
} from "@/lib/public-create-event-data";
import { cn } from "@/lib/utils";

export function PublicCreateEventPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-deep via-brand to-brand-light text-white">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-brand-light/20 blur-2xl" aria-hidden />
        <Container className="relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Text variant="overline" className="text-white/70">
              Untuk Event Creator
            </Text>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Buat Event Kamu Sendiri Secara Online & Gratis
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/85">
              Platform lengkap untuk membuat, mempromosikan, dan mengelola event — dari penjualan
              tiket hingga check-in peserta di lokasi.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {createEventHeroPerks.map((perk) => (
                <span
                  key={perk}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm sm:text-sm"
                >
                  {perk}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <CreateEventCtaButton
                size="lg"
                className="bg-white text-brand shadow-lg hover:bg-white/90"
              />
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href={routes.pricing}>Lihat biaya platform</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/60">
              Sudah punya akun?{" "}
              <Link
                href={routes.loginWithRedirect(routes.buatEvent)}
                className="font-medium text-white underline-offset-4 hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b bg-surface py-12 md:py-16">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Text variant="overline" className="text-brand">
              Cara Kerja
            </Text>
            <Text variant="h2" className="mt-2">
              Empat langkah mulai jual tiket
            </Text>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {createEventSteps.map((item) => (
              <Card key={item.step} className="border-border/80 shadow-sm">
                <CardContent className="space-y-3 pt-6">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-muted text-sm font-bold text-brand">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Text variant="h2">Dukung event offline & online</Text>
            <p className="mt-3 text-muted-foreground">
              Pilih format yang sesuai kebutuhanmu — konser di venue, webinar, hybrid, atau workshop.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <FormatCard title="Event Offline" subtitle="Konser, festival, seminar di venue" features={offlineEventFeatures} />
            <FormatCard
              title="Event Online"
              subtitle="Webinar, live streaming, kelas virtual"
              features={onlineEventFeatures}
              accent="sky"
            />
          </div>
        </Container>
      </section>

      <section className="bg-surface py-12 md:py-16">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Text variant="h2">Keunggulan platform</Text>
            <p className="mt-3 text-muted-foreground">
              Semua yang dibutuhkan organizer modern dalam satu workspace.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {createEventPlatformBenefits.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="h-full border-border/80">
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <Text variant="overline" className="text-brand">
                Pembayaran
              </Text>
              <Text variant="h2">Metode pembayaran beragam</Text>
              <p className="text-muted-foreground">
                Permudah transaksi peserta dengan berbagai metode pembayaran melalui Midtrans.
                Peserta mendapat e-tiket otomatis setelah pembayaran berhasil.
              </p>
              <Link
                href={routes.pricing}
                className="inline-flex text-sm font-medium text-brand hover:underline"
              >
                Lihat detail biaya platform →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {createEventPaymentMethods.map((method) => (
                <span
                  key={method}
                  className="rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-medium shadow-sm"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t bg-surface py-12 md:py-16">
        <Container>
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <Text variant="h2">FAQ Event Creator</Text>
            <p className="mt-3 text-muted-foreground">
              Pertanyaan umum seputar membuat dan mengelola event di Laristix.
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {createEventFaqItems.map((faq, index) => (
                <AccordionItem key={faq.question} value={`creator-faq-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium hover:text-brand">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Butuh jawaban lain? Lihat{" "}
              <Link href={routes.faq} className="font-medium text-brand hover:underline">
                FAQ lengkap
              </Link>{" "}
              atau halaman{" "}
              <Link href={routes.about} className="font-medium text-brand hover:underline">
                Tentang Kami
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-deep via-brand to-brand-light px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
            <div className="absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
              Siap menjadi Event Creator?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/85">
              Mulai buat event pertamamu dalam hitungan menit. Gratis untuk memulai, tanpa biaya
              bulanan.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <CreateEventCtaButton
                size="lg"
                className="bg-white text-brand hover:bg-white/90"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function FormatCard({
  title,
  subtitle,
  features,
  accent = "brand",
}: {
  title: string;
  subtitle: string;
  features: typeof offlineEventFeatures;
  accent?: "brand" | "sky";
}) {
  return (
    <Card className="h-full overflow-hidden border-border/80 shadow-sm">
      <CardHeader className={cn("border-b", accent === "sky" ? "bg-sky-500/5" : "bg-brand/5")}>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="flex gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  accent === "sky" ? "bg-sky-500/10 text-sky-600" : "bg-brand-muted text-brand",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-foreground">{feature.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
