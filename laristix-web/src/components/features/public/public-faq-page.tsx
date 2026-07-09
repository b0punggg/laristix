"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";
import { publicFaqCategories, publicFaqItems } from "@/lib/public-faq-items";
import { cn } from "@/lib/utils";

type FaqCategory = (typeof publicFaqCategories)[number]["id"] | "all";

export function PublicFaqPage() {
  const [category, setCategory] = useState<FaqCategory>("all");

  const filteredFaqs =
    category === "all"
      ? publicFaqItems
      : publicFaqItems.filter((item) => item.category === category);

  return (
    <>
      <section className="border-b bg-surface">
        <Container className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Text variant="overline" className="text-brand">
              FAQ
            </Text>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pertanyaan yang sering diajukan
            </h1>
            <p className="mt-4 text-muted-foreground">
              Temukan jawaban seputar pembelian tiket, organizer, dan penggunaan platform Laristix.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                category === "all"
                  ? "bg-brand text-brand-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              Semua
            </button>
            {publicFaqCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  category === item.id
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium hover:text-brand">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 rounded-2xl border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Belum menemukan jawaban? Kunjungi halaman{" "}
              <Link href={routes.about} className="font-medium text-brand hover:underline">
                Tentang Kami
              </Link>{" "}
              atau hubungi Customer Service melalui footer.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
