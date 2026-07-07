import { Search, Ticket, UserPlus } from "lucide-react";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Temukan Event",
    description: "Jelajahi ribuan event berdasarkan kategori, kota, atau tanggal.",
  },
  {
    step: "02",
    icon: Ticket,
    title: "Pesan Tiket",
    description: "Pilih tiket, isi data, dan bayar dengan metode favoritmu.",
  },
  {
    step: "03",
    icon: UserPlus,
    title: "Nikmati Acara",
    description: "Tunjukkan e-tiket di lokasi dan nikmati pengalamannya.",
  },
] as const;

export function PublicHomeHowItWorksSection() {
  return (
    <section className="bg-surface py-12 md:py-20">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Text variant="overline" className="text-brand">
            Cara Kerja
          </Text>
          <Text variant="h2" className="mt-2">
            Pesan tiket dalam 3 langkah mudah
          </Text>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-border md:block" aria-hidden />

          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-6 flex size-24 flex-col items-center justify-center rounded-2xl border-2 border-brand bg-card shadow-sm">
                  <span className="text-xs font-bold text-brand">{item.step}</span>
                  <Icon className="mt-1 size-8 text-brand" aria-hidden />
                </div>
                <Text variant="h4">{item.title}</Text>
                <Text variant="caption" className="mt-2 max-w-xs leading-relaxed">
                  {item.description}
                </Text>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
