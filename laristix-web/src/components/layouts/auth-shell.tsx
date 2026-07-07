"use client";

import { CalendarDays, ShieldCheck, Sparkles, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { AppLogo } from "@/components/common/app-logo";
import { cn } from "@/lib/utils";
import { routes } from "@/config/env";

export type AuthShellVariant = "login" | "register" | "security" | "verify" | "organizer";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  variant?: AuthShellVariant;
  wide?: boolean;
}

const variantConfig: Record<
  AuthShellVariant,
  { headline: string; subline: string; accent: string; icons: React.ElementType[] }
> = {
  login: {
    headline: "Kelola event dengan percaya diri",
    subline: "Platform tiket modern untuk organizer, staff, dan peserta event di seluruh Indonesia.",
    accent: "from-brand/30 via-violet-500/20 to-sky-500/20",
    icons: [Ticket, CalendarDays, Users],
  },
  register: {
    headline: "Mulai perjalanan event Anda",
    subline: "Buat akun gratis dan publikasikan event pertama dalam hitungan menit.",
    accent: "from-emerald-500/25 via-brand/20 to-cyan-500/20",
    icons: [Sparkles, CalendarDays, Ticket],
  },
  security: {
    headline: "Keamanan akun Anda penting",
    subline: "Kami membantu Anda kembali ke akun dengan aman melalui verifikasi email.",
    accent: "from-amber-500/20 via-brand/20 to-rose-500/20",
    icons: [ShieldCheck, Sparkles, Ticket],
  },
  verify: {
    headline: "Hampir selesai",
    subline: "Verifikasi email memastikan akun Anda aman dan siap digunakan.",
    accent: "from-sky-500/25 via-brand/20 to-indigo-500/20",
    icons: [ShieldCheck, CalendarDays, Users],
  },
  organizer: {
    headline: "Pilih workspace Anda",
    subline: "Kelola event, tim, dan penjualan tiket dari satu dashboard organizer.",
    accent: "from-violet-500/25 via-brand/20 to-fuchsia-500/20",
    icons: [Users, CalendarDays, Ticket],
  },
};

const socialProof = [
  { value: "10K+", label: "Event dipublikasikan" },
  { value: "500+", label: "Organizer aktif" },
  { value: "99.9%", label: "Uptime platform" },
];

function AuthIllustration({ variant }: { variant: AuthShellVariant }) {
  const config = variantConfig[variant];
  const [PrimaryIcon, SecondaryIcon, TertiaryIcon] = config.icons;

  return (
    <div className="relative flex h-full min-h-[280px] flex-col justify-between p-8 lg:min-h-0 lg:p-12">
      <div className="relative z-10">
        <AppLogo variant="storefront" className="text-white" />
        <h2 className="mt-10 max-w-md text-3xl font-bold tracking-tight text-white lg:text-4xl">
          {config.headline}
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">{config.subline}</p>
      </div>

      <div className="relative z-10 mt-10 hidden lg:block">
        <div className="grid grid-cols-3 gap-4">
          {socialProof.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-white/70">{item.label}</p>
            </div>
          ))}
        </div>
        <blockquote className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-white/90">
            &ldquo;Laristix memudahkan kami mengelola ribuan peserta tanpa drama di hari H.&rdquo;
          </p>
          <footer className="mt-3 text-xs font-medium text-white/60">
            — Tim Festival Nusantara
          </footer>
        </blockquote>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className={cn(
            "auth-orb auth-orb-1 absolute -left-16 top-16 size-56 rounded-full bg-gradient-to-br blur-3xl",
            config.accent,
          )}
        />
        <div className="auth-orb auth-orb-2 absolute -right-10 bottom-20 size-72 rounded-full bg-gradient-to-br from-white/20 to-brand/30 blur-3xl" />
        <div className="absolute right-12 top-24 flex size-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md">
          <PrimaryIcon className="size-9 text-white/90" />
        </div>
        <div className="absolute bottom-32 left-16 flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">
          <SecondaryIcon className="size-6 text-white/80" />
        </div>
        <div className="absolute right-32 bottom-48 hidden size-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-md lg:flex">
          <TertiaryIcon className="size-5 text-white/70" />
        </div>
      </div>
    </div>
  );
}

export function AuthShell({
  children,
  title,
  description,
  variant = "login",
  wide = false,
}: AuthShellProps) {
  const config = variantConfig[variant];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="auth-bg-mesh pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-brand/40 lg:w-[46%] xl:w-[42%]",
            config.accent,
          )}
        >
          <AuthIllustration variant={variant} />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between px-4 py-4 lg:hidden">
            <AppLogo />
            <Link href={routes.home} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Beranda
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
            <div className={cn("w-full", wide ? "max-w-xl" : "max-w-md")}>
              <div className="auth-glass-card rounded-3xl border p-6 shadow-2xl sm:p-8">
                <div className="mb-6 space-y-2 text-center lg:text-left">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {title}
                  </h1>
                  {description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                  ) : null}
                </div>
                {children}
              </div>

              <p className="mt-6 text-center text-xs text-muted-foreground lg:text-left">
                © {new Date().getFullYear()} Laristix. Platform manajemen event terpercaya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
