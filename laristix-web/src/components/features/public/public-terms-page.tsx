import Link from "next/link";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";

const sections = [
  {
    title: "1. Ketentuan Umum",
    paragraphs: [
      "Selamat datang di Laristix. Dengan mengakses atau menggunakan platform Laristix, Anda menyetujui Syarat & Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.",
      "Laristix menyediakan platform penjualan dan pembelian tiket event. Kami bertindak sebagai perantara antara organizer (penyelenggara) dan peserta (pembeli tiket). Kebijakan refund, jadwal, dan ketentuan khusus event dapat ditetapkan oleh masing-masing organizer.",
    ],
  },
  {
    title: "2. Akun Pengguna",
    paragraphs: [
      "Anda wajib memberikan informasi yang akurat dan terkini saat mendaftar akun. Anda bertanggung jawab menjaga kerahasiaan kredensial akun dan semua aktivitas yang terjadi melalui akun tersebut.",
      "Laristix berhak menangguhkan atau menonaktifkan akun yang melanggar ketentuan ini, melakukan aktivitas penipuan, atau merugikan pengguna lain.",
    ],
  },
  {
    title: "3. Pembelian Tiket",
    paragraphs: [
      "Harga tiket, kuota, dan ketersediaan ditentukan oleh organizer. Transaksi dianggap berhasil setelah pembayaran dikonfirmasi oleh sistem pembayaran kami.",
      "Tiket bersifat pribadi dan tidak boleh dijual kembali tanpa izin organizer, kecuali diizinkan secara tertulis. Laristix berhak membatalkan tiket yang terindikasi penipuan atau pelanggaran hukum.",
    ],
  },
  {
    title: "4. Pembayaran",
    paragraphs: [
      "Pembayaran diproses melalui mitra pembayaran terpercaya (misalnya Midtrans). Biaya layanan, pajak, atau biaya tambahan lainnya—jika ada—akan ditampilkan sebelum Anda menyelesaikan pembayaran.",
      "Jika pembayaran gagal atau kedaluwarsa, pesanan dapat dibatalkan secara otomatis dan tiket tidak dijamin tersedia.",
    ],
  },
  {
    title: "5. E-Tiket dan Check-in",
    paragraphs: [
      "Setelah pembayaran berhasil, e-tiket akan tersedia di akun Anda. Anda wajib membawa e-tiket (QR code) saat check-in di lokasi event.",
      "Kehilangan akses e-tiket akibat kelalaian pengguna bukan tanggung jawab Laristix. Pastikan perangkat Anda memiliki koneksi internet yang memadai saat menampilkan tiket.",
    ],
  },
  {
    title: "6. Pembatalan dan Refund",
    paragraphs: [
      "Kebijakan pembatalan dan refund ditentukan oleh organizer masing-masing event. Laristix akan memfasilitasi proses sesuai kebijakan yang berlaku dan ketentuan hukum yang berlaku di Indonesia.",
      "Permintaan refund harus diajukan melalui saluran resmi Laristix dengan menyertakan bukti transaksi. Proses refund dapat memakan waktu sesuai kebijakan bank atau penyedia pembayaran.",
    ],
  },
  {
    title: "7. Organizer",
    paragraphs: [
      "Organizer wajib memberikan informasi event yang benar, mematuhi peraturan setempat, dan bertanggung jawab atas pelaksanaan acara. Laristix berhak meninjau, menangguhkan, atau menghapus event yang melanggar hukum atau kebijakan platform.",
      "Pendapatan penjualan tiket akan diselesaikan kepada organizer sesuai perjanjian dan jadwal payout yang berlaku.",
    ],
  },
  {
    title: "8. Batasan Tanggung Jawab",
    paragraphs: [
      "Laristix tidak bertanggung jawab atas perubahan jadwal, pembatalan event, atau kerugian yang timbul dari keputusan organizer. Kami berupaya menyediakan layanan yang andal, namun tidak menjamin platform bebas dari gangguan teknis.",
      "Dalam batas yang diizinkan hukum, tanggung jawab Laristix terbatas pada nilai transaksi terkait yang menjadi sengketa.",
    ],
  },
  {
    title: "9. Perubahan Ketentuan",
    paragraphs: [
      "Laristix dapat memperbarui Syarat & Ketentuan ini sewaktu-waktu. Perubahan material akan diinformasikan melalui platform. Penggunaan layanan setelah perubahan berlaku dianggap sebagai persetujuan Anda terhadap ketentuan yang diperbarui.",
    ],
  },
  {
    title: "10. Hukum yang Berlaku",
    paragraphs: [
      "Syarat & Ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa yang tidak dapat diselesaikan secara musyawarah akan diselesaikan melalui pengadilan yang berwenang di Indonesia.",
      "Untuk pertanyaan terkait ketentuan ini, silakan hubungi tim dukungan Laristix melalui halaman Customer Service.",
    ],
  },
] as const;

export function PublicTermsPage() {
  return (
    <>
      <section className="border-b bg-surface">
        <Container className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <Text variant="overline" className="text-brand">
              Legal
            </Text>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Syarat & Ketentuan
            </h1>
            <p className="mt-4 text-muted-foreground">
              Terakhir diperbarui:{" "}
              {new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Dokumen ini mengatur penggunaan platform Laristix oleh peserta dan organizer.
              Harap baca dengan saksama sebelum menggunakan layanan kami.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <Text variant="h3" className="mb-3">
                {section.title}
              </Text>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <div className="rounded-2xl border bg-muted/30 p-6">
            <p className="text-sm text-muted-foreground">
              Dengan menggunakan Laristix, Anda menyetujui Syarat & Ketentuan ini. Pelajari
              juga{" "}
              <Link href={routes.about} className="font-medium text-brand hover:underline">
                Tentang Kami
              </Link>{" "}
              untuk informasi lebih lanjut mengenai platform.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
