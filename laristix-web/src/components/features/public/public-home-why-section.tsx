import { CreditCard, Headphones, QrCode, ShieldCheck, Ticket, Zap } from "lucide-react";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";

const features = [
  {
    icon: ShieldCheck,
    title: "Pembayaran Aman",
    description: "Transaksi dilindungi Midtrans dengan enkripsi standar industri.",
  },
  {
    icon: Zap,
    title: "E-Tiket Instan",
    description: "Tiket digital langsung masuk setelah pembayaran berhasil.",
  },
  {
    icon: QrCode,
    title: "Check-in Cepat",
    description: "Scan QR code di pintu masuk — tanpa antre panjang.",
  },
  {
    icon: CreditCard,
    title: "Multi Pembayaran",
    description: "QRIS, e-wallet, transfer bank, dan kartu kredit.",
  },
  {
    icon: Ticket,
    title: "Manajemen Tiket",
    description: "Atur kuota, harga, dan kategori tiket dengan mudah.",
  },
  {
    icon: Headphones,
    title: "Dukungan 24/7",
    description: "Tim support siap membantu organizer dan peserta.",
  },
] as const;

export function PublicHomeWhySection() {
  return (
    <section id="tentang" className="py-12 md:py-20">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Text variant="overline" className="text-brand">
            Mengapa Laristix
          </Text>
          <Text variant="h2" className="mt-2">
            Platform event terlengkap untuk Indonesia
          </Text>
          <Text variant="body-md" color="muted" className="mt-3">
            Dari penemuan event hingga check-in di lokasi — semua dalam satu platform yang dirancang untuk pengalaman premium.
          </Text>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="size-5" aria-hidden />
                </div>
                <Text variant="h4">{feature.title}</Text>
                <Text variant="caption" className="mt-2 leading-relaxed">
                  {feature.description}
                </Text>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
