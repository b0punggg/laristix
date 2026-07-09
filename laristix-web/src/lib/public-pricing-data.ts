export type PricingTab = "social-media" | "website" | "package" | "addon";

export interface PromoPackage {
  id: string;
  tab: PricingTab;
  name: string;
  priceFrom: number;
  features: string[];
}

export const pricingTabs: Array<{ id: PricingTab; label: string }> = [
  { id: "social-media", label: "Social Media" },
  { id: "website", label: "Website" },
  { id: "package", label: "Package" },
  { id: "addon", label: "Add-on" },
];

export const promoPackages: PromoPackage[] = [
  {
    id: "ig-ads",
    tab: "social-media",
    name: "Instagram Ads",
    priceFrom: 600_000,
    features: [
      "Request dedicated city",
      "CTA link ke halaman event di Laristix",
      "Single content, multiple content, atau short video",
    ],
  },
  {
    id: "ig-feed",
    tab: "social-media",
    name: "Instagram Feed",
    priceFrom: 2_500_000,
    features: [
      "1 post",
      "Material post dari Laristix",
      "Caption dari event creator",
      "3 hashtag utama & 5 tag",
    ],
  },
  {
    id: "ig-story",
    tab: "social-media",
    name: "Instagram Story",
    priceFrom: 500_000,
    features: [
      "1 story",
      "CTA link ke halaman event di Laristix",
      "Material dari event creator",
    ],
  },
  {
    id: "ig-reels",
    tab: "social-media",
    name: "Instagram Reels",
    priceFrom: 1_300_000,
    features: [
      "1 reels",
      "Material post dari Laristix",
      "Caption dari event creator",
      "3 hashtag utama & 5 tag",
    ],
  },
  {
    id: "tiktok-foto",
    tab: "social-media",
    name: "TikTok Post (Foto)",
    priceFrom: 800_000,
    features: [
      "1 post",
      "Material dari event creator",
      "Caption & 3 hashtag utama",
    ],
  },
  {
    id: "tiktok-video",
    tab: "social-media",
    name: "TikTok Post (Video)",
    priceFrom: 1_000_000,
    features: [
      "1 video TikTok/Reels (maks. 1 menit)",
      "Material dari event creator",
      "5 hashtag utama & 3 tag",
    ],
  },
  {
    id: "x-post",
    tab: "social-media",
    name: "X (Twitter)",
    priceFrom: 500_000,
    features: [
      "1 post",
      "Material dari Laristix",
      "Caption dari event creator",
      "5 hashtag & 3 tag",
    ],
  },
  {
    id: "fb-post",
    tab: "social-media",
    name: "Facebook Post",
    priceFrom: 500_000,
    features: [
      "1 post",
      "Material dari Laristix",
      "Direct link ke event di Laristix",
      "3 hashtag & 5 tag",
    ],
  },
  {
    id: "homepage-banner",
    tab: "website",
    name: "Homepage Banner",
    priceFrom: 3_000_000,
    features: [
      "Banner carousel di halaman utama Laristix",
      "Durasi tayang 7 hari",
      "Link langsung ke halaman event",
    ],
  },
  {
    id: "featured-event",
    tab: "website",
    name: "Featured Event",
    priceFrom: 1_500_000,
    features: [
      "Posisi unggulan di halaman jelajah event",
      "Badge featured pada kartu event",
      "Durasi tayang 14 hari",
    ],
  },
  {
    id: "category-highlight",
    tab: "website",
    name: "Category Highlight",
    priceFrom: 1_000_000,
    features: [
      "Highlight di kategori event terkait",
      "Prioritas tampil di filter kategori",
      "Durasi tayang 7 hari",
    ],
  },
  {
    id: "starter-package",
    tab: "package",
    name: "Starter Package",
    priceFrom: 4_500_000,
    features: [
      "Instagram Feed + Story",
      "Featured Event 7 hari",
      "Konsultasi setup event",
    ],
  },
  {
    id: "growth-package",
    tab: "package",
    name: "Growth Package",
    priceFrom: 8_500_000,
    features: [
      "Instagram Feed + Reels + Story",
      "Homepage Banner 7 hari",
      "Featured Event 14 hari",
    ],
  },
  {
    id: "premium-package",
    tab: "package",
    name: "Premium Package",
    priceFrom: 15_000_000,
    features: [
      "Paket social media lengkap",
      "Homepage Banner 14 hari",
      "Dedicated account support",
    ],
  },
  {
    id: "email-blast",
    tab: "addon",
    name: "Email Blast",
    priceFrom: 750_000,
    features: [
      "Distribusi ke database peserta Laristix",
      "Desain template email",
      "Laporan performa kampanye",
    ],
  },
  {
    id: "onsite-activation",
    tab: "addon",
    name: "On-site Activation",
    priceFrom: 5_000_000,
    features: [
      "Tim activation di lokasi event",
      "Setup booth & lead capture",
      "Laporan pasca event",
    ],
  },
];

export const ticketFeeRules = [
  "Biaya admin fee = Rp5.000 + 5% dari harga tiket per transaksi",
  "Biaya admin fee tidak dibebankan kepada event creator (ditanggung pembeli)",
  "Biaya sudah termasuk PPN 11%",
  "Pajak hiburan daerah menjadi tanggung jawab event creator",
];

export const platformFeatures = [
  {
    title: "Manajemen Tiket Terintegrasi",
    description:
      "Buat, kelola, distribusikan, dan pantau tiket dalam satu platform terpusat dari penjualan hingga check-in.",
  },
  {
    title: "Pelaporan Real-Time",
    description:
      "Pantau penjualan tiket dan performa event secara langsung untuk keputusan berbasis data.",
  },
  {
    title: "Laporan Detail Penjualan",
    description:
      "Laporan komprehensif mencakup transaksi, biaya layanan, dan hasil bersih yang dapat ditarik.",
  },
  {
    title: "Distribusi E-Ticket",
    description:
      "Pembeli menerima e-tiket otomatis melalui email setelah pembayaran berhasil.",
  },
  {
    title: "Dukungan Pelanggan Responsif",
    description:
      "Tim support siap membantu organizer dan peserta untuk pengalaman yang optimal.",
  },
  {
    title: "Penarikan Dana Fleksibel",
    description:
      "Organizer dapat menarik hasil penjualan sesuai jadwal payout yang berlaku.",
  },
  {
    title: "Fitur Voucher dan Diskon",
    description:
      "Buat kode promo untuk kampanye marketing, sponsor, atau strategi penjualan tiket.",
  },
  {
    title: "Check-in QR Terintegrasi",
    description:
      "Validasi tiket peserta di lokasi event melalui scanner Laristix yang cepat dan akurat.",
  },
  {
    title: "Penjualan On-the-Spot",
    description:
      "Dukungan penjualan tiket langsung di lokasi acara melalui sistem yang sama.",
  },
] as const;

export const DEFAULT_FLAT_FEE = 5_000;
export const DEFAULT_PERCENTAGE_FEE = 5;

export function calculateTicketAdminFee(ticketPrice: number): number {
  if (ticketPrice <= 0) return 0;
  return Math.round((ticketPrice * DEFAULT_PERCENTAGE_FEE) / 100 + DEFAULT_FLAT_FEE);
}
