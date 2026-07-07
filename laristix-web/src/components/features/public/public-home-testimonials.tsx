import { Quote } from "lucide-react";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";

const testimonials = [
  {
    quote:
      "Laristix memudahkan kami menjual 2.000 tiket konser dalam 48 jam. Dashboard-nya intuitif dan pembayaran langsung masuk.",
    name: "Rina Wijaya",
    role: "Event Manager, Soundwave Festival",
    initials: "RW",
  },
  {
    quote:
      "Sebagai peserta, saya suka betapa cepatnya proses beli tiket. E-tiket langsung masuk dan check-in di venue sangat lancar.",
    name: "Andi Pratama",
    role: "Penggemar musik live",
    initials: "AP",
  },
  {
    quote:
      "Platform terbaik untuk workshop dan seminar. Fitur form pendaftaran dan laporan kehadiran sangat membantu tim kami.",
    name: "Dewi Kartika",
    role: "Founder, Creative Labs",
    initials: "DK",
  },
] as const;

export function PublicHomeTestimonialsSection() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Text variant="overline" className="text-brand">
            Testimoni
          </Text>
          <Text variant="h2" className="mt-2">
            Dipercaya organizer & peserta
          </Text>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Quote className="mb-4 size-8 text-brand/40" aria-hidden />
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t pt-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-brand-muted text-xs font-bold text-brand">
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
