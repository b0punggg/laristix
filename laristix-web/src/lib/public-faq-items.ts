export interface PublicFaqItem {
  question: string;
  answer: string;
  category: "peserta" | "organizer" | "umum";
}

export const publicFaqItems: PublicFaqItem[] = [
  {
    category: "peserta",
    question: "Bagaimana cara membeli tiket di Laristix?",
    answer:
      "Cari event yang kamu inginkan, pilih jenis tiket, isi data diri, lalu selesaikan pembayaran. E-tiket akan langsung tersedia di akunmu setelah pembayaran berhasil.",
  },
  {
    category: "peserta",
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "Kami mendukung QRIS, GoPay, ShopeePay, transfer bank, dan kartu kredit/debit melalui Midtrans — salah satu gateway pembayaran terpercaya di Indonesia.",
  },
  {
    category: "peserta",
    question: "Apakah tiket bisa direfund?",
    answer:
      "Kebijakan refund ditentukan oleh masing-masing organizer. Detail kebijakan refund biasanya tercantum di halaman event sebelum kamu melakukan pembelian.",
  },
  {
    category: "peserta",
    question: "Bagaimana cara menggunakan e-tiket di lokasi event?",
    answer:
      "Buka menu Tiket Saya di akun Laristix, pilih event yang akan kamu hadiri, lalu tunjukkan QR code kepada petugas check-in di venue.",
  },
  {
    category: "organizer",
    question: "Bagaimana cara menjadi organizer di Laristix?",
    answer:
      "Klik 'Buat Event Kamu', daftarkan organisasimu, dan mulai buat event pertama. Tim kami akan memverifikasi akun organizer sebelum event dipublikasikan.",
  },
  {
    category: "organizer",
    question: "Apakah ada biaya untuk organizer?",
    answer:
      "Laristix menawarkan model biaya transparan. Organizer hanya dikenakan biaya platform per tiket terjual — tanpa biaya bulanan atau setup fee.",
  },
  {
    category: "organizer",
    question: "Apakah Laristix menyediakan fitur check-in?",
    answer:
      "Ya. Organizer dapat menggunakan fitur scan QR untuk memvalidasi tiket peserta di lokasi event melalui dashboard dan aplikasi scanner Laristix.",
  },
  {
    category: "umum",
    question: "Bagaimana cara menghubungi customer service?",
    answer:
      "Kamu dapat menghubungi tim dukungan Laristix melalui tautan Customer Service di bagian atas situs atau footer. Sertakan nomor pesanan jika pertanyaan terkait transaksi.",
  },
];

export const publicFaqCategories = [
  { id: "peserta" as const, label: "Untuk Peserta" },
  { id: "organizer" as const, label: "Untuk Organizer" },
  { id: "umum" as const, label: "Umum" },
];
