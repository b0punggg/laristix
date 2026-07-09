import Link from "next/link";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { routes } from "@/config/env";

const sections = [
  {
    title: "1. Pendahuluan",
    paragraphs: [
      "Laristix menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi saat Anda menggunakan platform Laristix sebagai peserta maupun organizer.",
      "Dengan menggunakan layanan kami, Anda menyetujui praktik pemrosesan data sebagaimana dijelaskan dalam kebijakan ini.",
    ],
  },
  {
    title: "2. Data yang Kami Kumpulkan",
    paragraphs: [
      "Data identitas: nama, alamat email, nomor telepon, dan informasi profil akun.",
      "Data transaksi: riwayat pembelian tiket, detail pembayaran, nomor pesanan, dan status transaksi. Data kartu pembayaran diproses langsung oleh mitra pembayaran kami dan tidak disimpan sepenuhnya oleh Laristix.",
      "Data teknis: alamat IP, jenis perangkat, browser, log aktivitas, dan cookie yang diperlukan untuk keamanan serta pengoperasian platform.",
      "Data organizer: informasi organisasi, logo, deskripsi, data event, dan laporan operasional terkait penjualan tiket.",
    ],
  },
  {
    title: "3. Tujuan Penggunaan Data",
    paragraphs: [
      "Memproses pembelian tiket, pembayaran, penerbitan e-tiket, dan check-in event.",
      "Mengelola akun pengguna, autentikasi, dan komunikasi layanan (misalnya konfirmasi transaksi atau pembaruan event).",
      "Menyediakan dukungan pelanggan, mencegah penipuan, dan menjaga keamanan platform.",
      "Menganalisis penggunaan platform untuk meningkatkan fitur dan pengalaman pengguna.",
      "Memenuhi kewajiban hukum dan permintaan otoritas yang berwenang.",
    ],
  },
  {
    title: "4. Pembagian Data kepada Pihak Ketiga",
    paragraphs: [
      "Kami dapat membagikan data terbatas kepada organizer terkait transaksi event yang Anda ikuti, mitra pembayaran (misalnya Midtrans), penyedia infrastruktur cloud, dan layanan analitik yang membantu operasional platform.",
      "Kami tidak menjual data pribadi Anda kepada pihak ketiga. Pembagian data hanya dilakukan sesuai kebutuhan layanan, perjanjian kerahasiaan, dan ketentuan hukum yang berlaku.",
    ],
  },
  {
    title: "5. Cookie dan Teknologi Pelacakan",
    paragraphs: [
      "Laristix menggunakan cookie dan teknologi serupa untuk menjaga sesi login, mengingat preferensi, serta menganalisis performa platform.",
      "Anda dapat mengatur preferensi cookie melalui pengaturan browser. Menonaktifkan cookie tertentu dapat memengaruhi fungsi beberapa fitur.",
    ],
  },
  {
    title: "6. Penyimpanan dan Keamanan Data",
    paragraphs: [
      "Kami menyimpan data selama diperlukan untuk tujuan layanan, pemenuhan hukum, dan penyelesaian sengketa. Setelah tidak diperlukan, data akan dihapus atau dianonimkan sesuai kebijakan retensi internal.",
      "Laristix menerapkan langkah keamanan teknis dan organisasi yang wajar, termasuk enkripsi pada saluran komunikasi dan kontrol akses, untuk melindungi data dari akses tidak sah.",
    ],
  },
  {
    title: "7. Hak Pengguna",
    paragraphs: [
      "Sesuai peraturan perlindungan data yang berlaku, Anda berhak mengakses, memperbarui, atau meminta penghapusan data pribadi tertentu melalui pengaturan akun atau dengan menghubungi tim dukungan Laristix.",
      "Anda dapat menarik persetujuan pemrosesan data untuk tujuan tertentu, sepanjang tidak mengganggu layanan inti yang Anda gunakan.",
    ],
  },
  {
    title: "8. Data Anak",
    paragraphs: [
      "Laristix tidak secara sengaja mengumpulkan data dari anak di bawah usia 13 tahun tanpa persetujuan orang tua atau wali. Jika kami mengetahui adanya pengumpulan data tersebut, kami akan mengambil langkah untuk menghapusnya.",
    ],
  },
  {
    title: "9. Perubahan Kebijakan",
    paragraphs: [
      "Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan material akan diinformasikan melalui platform. Tanggal pembaruan terakhir akan ditampilkan di bagian atas halaman ini.",
    ],
  },
  {
    title: "10. Hubungi Kami",
    paragraphs: [
      "Jika Anda memiliki pertanyaan tentang Kebijakan Privasi atau ingin mengajukan permintaan terkait data pribadi, silakan hubungi tim dukungan Laristix melalui saluran Customer Service resmi.",
    ],
  },
] as const;

export function PublicPrivacyPage() {
  return (
    <>
      <section className="border-b bg-surface">
        <Container className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <Text variant="overline" className="text-brand">
              Legal
            </Text>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Kebijakan Privasi
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
              Kebijakan ini menjelaskan bagaimana Laristix memproses dan melindungi data pribadi
              pengguna platform tiket event kami.
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
              Penggunaan Laristix juga tunduk pada{" "}
              <Link href={routes.terms} className="font-medium text-brand hover:underline">
                Syarat & Ketentuan
              </Link>{" "}
              kami. Untuk informasi umum platform, kunjungi halaman{" "}
              <Link href={routes.about} className="font-medium text-brand hover:underline">
                Tentang Kami
              </Link>
              .
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
