import {
  BarChart3,
  CreditCard,
  Globe,
  MapPin,
  QrCode,
  ScanLine,
  Ticket,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

export const createEventOnboardingTarget = "/events/new?onboarding=1";

export const createEventHeroPerks = [
  "Gratis memulai",
  "Tanpa biaya bulanan",
  "Check-in QR terintegrasi",
  "Dashboard analitik real-time",
] as const;

export const createEventSteps = [
  {
    step: "01",
    title: "Daftar & buat organizer",
    description: "Masuk atau daftar akun, lalu buat workspace organizer untuk brand atau tim eventmu.",
  },
  {
    step: "02",
    title: "Isi detail event",
    description: "Upload banner, tentukan jadwal, lokasi (offline atau online), dan deskripsi event.",
  },
  {
    step: "03",
    title: "Atur tiket & harga",
    description: "Buat tipe tiket, kuota, periode penjualan, dan publikasikan saat siap.",
  },
  {
    step: "04",
    title: "Terima pembayaran & check-in",
    description: "Peserta bayar online, terima e-tiket otomatis, lalu scan QR di lokasi event.",
  },
] as const;

export interface CreateEventFormatFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const offlineEventFeatures: CreateEventFormatFeature[] = [
  {
    icon: MapPin,
    title: "Lokasi & venue",
    description: "Kelola alamat venue, kapasitas, dan informasi lokasi untuk peserta.",
  },
  {
    icon: ScanLine,
    title: "Check-in di venue",
    description: "Scanner QR untuk validasi tiket cepat saat peserta tiba di lokasi.",
  },
  {
    icon: Users,
    title: "Kelola kehadiran",
    description: "Dashboard kehadiran real-time per event untuk tim operasional.",
  },
  {
    icon: Ticket,
    title: "Penjualan on-the-spot",
    description: "Dukungan penjualan tiket langsung di lokasi melalui sistem yang sama.",
  },
];

export const onlineEventFeatures: CreateEventFormatFeature[] = [
  {
    icon: Video,
    title: "Event online",
    description: "Tambahkan URL streaming atau link akses untuk peserta yang hadir secara virtual.",
  },
  {
    icon: Globe,
    title: "Distribusi e-tiket",
    description: "E-tiket otomatis ke email dan akun peserta setelah pembayaran berhasil.",
  },
  {
    icon: QrCode,
    title: "Kontrol akses",
    description: "Validasi peserta dengan kode unik per tiket untuk mencegah penyalahgunaan.",
  },
  {
    icon: BarChart3,
    title: "Pantau penjualan",
    description: "Lihat performa penjualan dan registrasi dari dashboard event.",
  },
];

export const createEventPaymentMethods = [
  "QRIS",
  "GoPay",
  "ShopeePay",
  "Transfer bank",
  "Kartu kredit & debit",
] as const;

export const createEventPlatformBenefits = [
  {
    icon: CreditCard,
    title: "Pembayaran beragam",
    description: "Terima pembayaran melalui Midtrans — gateway terpercaya di Indonesia.",
  },
  {
    icon: ScanLine,
    title: "Fitur check-in",
    description: "Proses check-in mulus dengan scanner QR untuk tim di lapangan.",
  },
  {
    icon: BarChart3,
    title: "Analitik penjualan",
    description: "Pantau order, pendapatan, dan kehadiran per event maupun seluruh portfolio.",
  },
  {
    icon: Users,
    title: "Kelola tim",
    description: "Undang admin, staff, dan scanner ke workspace organizer Anda.",
  },
] as const;

export const createEventFaqItems = [
  {
    question: "Bagaimana cara membuat event di Laristix?",
    answer:
      "Kunjungi halaman Buat Event, klik tombol mulai, daftar atau masuk, buat workspace organizer, lalu ikuti wizard pembuatan event. Setelah draft tersimpan, atur tiket dan publikasikan event.",
  },
  {
    question: "Apakah ada biaya untuk membuat event?",
    answer:
      "Tidak ada biaya bulanan atau biaya setup. Organizer dikenakan biaya platform per tiket terjual. Lihat halaman Biaya untuk detail kalkulator admin fee.",
  },
  {
    question: "Apa syarat untuk event berbayar?",
    answer:
      "Siapkan informasi organizer yang lengkap (nama, email, nomor telepon). Untuk skala produksi lebih besar, tim kami dapat meminta dokumen legal tambahan sesuai kebijakan platform.",
  },
  {
    question: "Bisakah saya membuat event online dan offline?",
    answer:
      "Ya. Laristix mendukung event di venue fisik maupun event online dengan URL streaming melalui pengaturan venue.",
  },
  {
    question: "Berapa lama event bisa dipublikasikan?",
    answer:
      "Setelah draft event dan tiket siap, Anda bisa mempublikasikan kapan saja. Jika organizer masih menunggu persetujuan platform, workspace tetap dapat digunakan untuk menyiapkan event.",
  },
  {
    question: "Apakah Laristix menyediakan fitur check-in?",
    answer:
      "Ya. Setiap event memiliki dashboard kehadiran dan mode scanner untuk memvalidasi tiket peserta di lokasi.",
  },
] as const;
