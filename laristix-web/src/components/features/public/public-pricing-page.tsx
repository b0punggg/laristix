"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";
import { formatCurrency } from "@/lib/currency";
import {
  calculateTicketAdminFee,
  platformFeatures,
  pricingTabs,
  promoPackages,
  ticketFeeRules,
  type PricingTab,
} from "@/lib/public-pricing-data";
import { cn } from "@/lib/utils";

function formatPriceLabel(amount: number) {
  return formatCurrency(amount).replace(/\s/g, "");
}

export function PublicPricingPage() {
  const [activeTab, setActiveTab] = useState<PricingTab>("social-media");
  const [ticketPrice, setTicketPrice] = useState("100000");

  const filteredPackages = useMemo(
    () => promoPackages.filter((item) => item.tab === activeTab),
    [activeTab],
  );

  const parsedTicketPrice = Number.parseInt(ticketPrice.replace(/\D/g, ""), 10) || 0;
  const adminFee = calculateTicketAdminFee(parsedTicketPrice);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-deep via-brand to-brand-light text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_45%)]"
          aria-hidden
        />
        <Container className="relative py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Text variant="overline" className="text-white/70">
              Biaya
            </Text>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Promosikan Eventmu di Laristix!
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/85 sm:text-lg">
              Pilih jenis promosi dan placement yang sesuai kebutuhanmu. Temukan berbagai paket
              marketing eksklusif untuk meningkatkan visibilitas event.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-10 md:py-14">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {pricingTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPackages.map((item) => (
            <Card key={item.id} className="flex h-full flex-col overflow-hidden">
              <CardContent className="flex h-full flex-col p-6">
                <h2 className="text-xl font-bold text-foreground">{item.name}</h2>
                <div className="my-5 border-t border-border/70" />
                <p className="text-sm font-medium text-muted-foreground">Mulai dari</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-brand">
                  {formatPriceLabel(item.priceFrom)}
                </p>
                <Button asChild className="mt-5 w-full bg-brand hover:bg-brand-hover">
                  <Link href="#dukungan">Hubungi Kami</Link>
                </Button>
                <ul className="mt-6 space-y-2.5 border-t border-border/70 pt-5">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>

      <section className="border-y bg-surface py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Text variant="h2">Biaya Transaksi Tiket</Text>
            <p className="mt-4 text-muted-foreground">
              Biaya admin fee tiket disesuaikan dengan harga tiket kamu. Berikut detailnya:
            </p>
          </div>

          <ul className="mx-auto mt-8 max-w-3xl space-y-3">
            {ticketFeeRules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <span>{rule}</span>
              </li>
            ))}
          </ul>

          <div className="mx-auto mt-10 max-w-xl rounded-2xl border bg-card p-6 shadow-sm md:p-8">
            <Text variant="h3" className="text-center">
              Ayo simulasikan Admin Fee untuk eventmu!
            </Text>
            <div className="mt-6 space-y-2">
              <label htmlFor="ticket-price" className="text-sm font-medium text-foreground">
                Harga Tiket
              </label>
              <Input
                id="ticket-price"
                inputMode="numeric"
                value={ticketPrice}
                onChange={(event) => setTicketPrice(event.target.value)}
                placeholder="Contoh: 100000"
              />
            </div>
            <div className="mt-6 rounded-xl bg-brand-muted/50 p-5 text-center">
              <p className="text-sm font-medium text-muted-foreground">Biaya transaksi</p>
              <p className="mt-1 text-3xl font-extrabold text-brand">
                {formatCurrency(adminFee)}
                <span className="text-base font-semibold text-muted-foreground">/Tiket</span>
              </p>
            </div>
            <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
              Berikut estimasi biaya admin fee per tiket. Butuh penawaran khusus? Hubungi tim
              Laristix untuk paket terbaik bagi eventmu.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="#dukungan">Nego di sini</Link>
              </Button>
              <Button asChild className="bg-brand hover:bg-brand-hover">
                <Link href={routes.buatEvent}>
                  Daftarkan Event
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-20">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Text variant="h2">Lebih Mudah Dengan Fitur yang Lengkap</Text>
            <p className="mt-3 text-muted-foreground">
              Laristix menyediakan infrastruktur ticketing end-to-end untuk organizer modern.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
