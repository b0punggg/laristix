"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";

const faqs = [
  {
    question: "Bagaimana cara membeli tiket di Laristix?",
    answer:
      "Cari event yang kamu inginkan, pilih jenis tiket, isi data diri, lalu selesaikan pembayaran. E-tiket akan langsung tersedia di akunmu setelah pembayaran berhasil.",
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "Kami mendukung QRIS, GoPay, ShopeePay, transfer bank, dan kartu kredit/debit melalui Midtrans — salah satu gateway pembayaran terpercaya di Indonesia.",
  },
  {
    question: "Apakah tiket bisa direfund?",
    answer:
      "Kebijakan refund ditentukan oleh masing-masing organizer. Detail kebijakan refund biasanya tercantum di halaman event sebelum kamu melakukan pembelian.",
  },
  {
    question: "Bagaimana cara menjadi organizer di Laristix?",
    answer:
      "Klik 'Buat Event Kamu', daftarkan organisasimu, dan mulai buat event pertama. Tim kami akan memverifikasi akun organizer sebelum event dipublikasikan.",
  },
  {
    question: "Apakah ada biaya untuk organizer?",
    answer:
      "Laristix menawarkan model biaya transparan. Organizer hanya dikenakan biaya platform per tiket terjual — tanpa biaya bulanan atau setup fee.",
  },
] as const;

export function PublicHomeFaqSection() {
  return (
    <section className="bg-surface py-12 md:py-20">
      <Container className="max-w-3xl">
        <div className="mb-10 text-center">
          <Text variant="overline" className="text-brand">
            FAQ
          </Text>
          <Text variant="h2" className="mt-2">
            Pertanyaan yang sering diajukan
          </Text>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium hover:text-brand">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
