"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  KeyRound,
  Laptop,
  Mail,
  MonitorSmartphone,
  MoonStar,
  ShoppingBag,
  ShieldCheck,
  Smartphone,
  Ticket,
  User2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSectionCard, FormTabButton } from "@/components/features/events/event-management-ui";
import { routes } from "@/config/env";
import { useMeQuery, useOrganizersQuery } from "@/hooks/use-auth";
import { canUseCreatorMode } from "@/lib/profile-mode";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileModeStore } from "@/stores/profile-mode-store";
import { cn } from "@/lib/utils";

type ProfileSectionId =
  | "personal"
  | "security"
  | "notifications"
  | "accounts"
  | "membership"
  | "devices"
  | "sessions";

const customerSectionMeta: Array<{
  id: ProfileSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "personal", label: "Personal Information", icon: User2 },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "accounts", label: "Connected Accounts", icon: Users },
  { id: "devices", label: "Devices", icon: MonitorSmartphone },
  { id: "sessions", label: "Sessions", icon: Laptop },
];

const creatorSectionMeta: Array<{
  id: ProfileSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "personal", label: "Personal Information", icon: User2 },
  { id: "membership", label: "Organizer Membership", icon: Building2 },
  { id: "notifications", label: "Workspace Notifications", icon: Bell },
  { id: "accounts", label: "Connected Accounts", icon: Users },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "devices", label: "Devices", icon: MonitorSmartphone },
  { id: "sessions", label: "Sessions", icon: Laptop },
];

function formatBrowserName(ua: string) {
  if (ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Chrome")) return "Google Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  return "Browser";
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Skeleton className="h-72 w-full rounded-3xl" />
        <div className="space-y-6">
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function ProfilePanel() {
  const hydrated = useAuthStore((s) => s.isHydrated);
  const storedUser = useAuthStore((s) => s.user);
  const meQuery = useMeQuery(hydrated && storedUser !== null);
  const organizersQuery = useOrganizersQuery(hydrated && storedUser !== null);
  const user = meQuery.data ?? storedUser;
  const profileMode = useProfileModeStore((s) => s.profileMode);
  const setProfileMode = useProfileModeStore((s) => s.setProfileMode);
  const [activeSection, setActiveSection] = useState<ProfileSectionId>("personal");
  const [deviceInfo, setDeviceInfo] = useState<{
    browser: string;
    platform: string;
    timezone: string;
  } | null>(null);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    setDeviceInfo({
      browser: formatBrowserName(ua),
      platform: window.navigator.platform || "Unknown device",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown timezone",
    });
  }, []);

  const profileInitials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [user?.name]);

  if (meQuery.isLoading && !user) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <FormSectionCard title="Profil tidak tersedia">
          <p className="text-sm text-muted-foreground">
            Kami tidak dapat memuat profil Anda saat ini.
          </p>
        </FormSectionCard>
      </div>
    );
  }

  const memberships = organizersQuery.data ?? [];
  const userCanUseCreatorMode = canUseCreatorMode(user);
  const sectionMeta = profileMode === "creator" ? creatorSectionMeta : customerSectionMeta;
  const currentSessionLabel = deviceInfo
    ? `${deviceInfo.browser} • ${deviceInfo.platform}`
    : "Current session";

  useEffect(() => {
    if (!userCanUseCreatorMode && profileMode === "creator") {
      setProfileMode("customer");
    }
  }, [userCanUseCreatorMode, profileMode, setProfileMode]);

  useEffect(() => {
    if (!sectionMeta.some((section) => section.id === activeSection)) {
      setActiveSection("personal");
    }
  }, [activeSection, sectionMeta]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <section className="rounded-3xl border border-border/80 bg-gradient-to-br from-brand-muted/70 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 ring-4 ring-background sm:size-20">
              <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-brand-muted text-lg font-semibold text-brand">
                {profileInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Badge variant="brand" className="rounded-full px-3 py-1">
                Profile Settings
              </Badge>
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{user.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.email_verified ? "success" : "warning"} className="rounded-full">
                  {user.email_verified ? "Email Verified" : "Email Unverified"}
                </Badge>
                <Badge variant={profileMode === "creator" ? "brand" : "secondary"} className="rounded-full">
                  {profileMode === "creator" ? "Creator Mode" : "Customer Mode"}
                </Badge>
                <Badge variant="outline" className="rounded-full capitalize">
                  {user.primary_role.replace("_", " ")}
                </Badge>
                {user.active_organizer ? (
                  <Badge variant="outline" className="rounded-full">
                    {user.active_organizer.name}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
              <p className="text-xs text-muted-foreground">Mode</p>
              <p className="mt-1 text-lg font-semibold">{profileMode === "creator" ? "Creator" : "Customer"}</p>
            </div>
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
              <p className="text-xs text-muted-foreground">Memberships</p>
              <p className="mt-1 text-lg font-semibold">{memberships.length}</p>
            </div>
            <div className="rounded-2xl bg-background/80 p-4 ring-1 ring-border/70">
              <p className="text-xs text-muted-foreground">Current session</p>
              <p className="mt-1 text-sm font-semibold">{deviceInfo?.browser ?? "Loading..."}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <FormSectionCard title="Sidebar Navigation" description="Navigasi cepat ke bagian profil.">
            <div className="hidden flex-col gap-2 lg:flex">
              {sectionMeta.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "ds-focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors",
                      activeSection === section.id
                        ? "bg-brand text-brand-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
              {sectionMeta.map((section) => (
                <FormTabButton
                  key={section.id}
                  active={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                </FormTabButton>
              ))}
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-border/70 bg-muted/20 p-3">
              {profileMode === "customer" ? (
                <>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href={routes.myTickets}>
                      My Tickets
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href={routes.myTransactions}>
                      Transactions
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href={routes.organizerDashboard}>
                      Dashboard
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href={routes.organizerEvents}>
                      Events
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </FormSectionCard>
        </aside>

        <div className="space-y-6">
          {(activeSection === "personal" || activeSection === "security") && (
            <div className="grid gap-6 xl:grid-cols-2">
              {activeSection === "personal" ? (
                <FormSectionCard
                  title="Personal Information"
                  description="Informasi akun utama Anda. Tampilan ini tidak mengubah logic backend."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField id="profile-name" label="Full Name" className="sm:col-span-2">
                      <Input id="profile-name" value={user.name} readOnly className="h-11 bg-muted/30" />
                    </FormField>
                    <FormField id="profile-email" label="Email">
                      <Input id="profile-email" value={user.email} readOnly className="h-11 bg-muted/30" />
                    </FormField>
                    <FormField id="profile-phone" label="Phone">
                      <Input
                        id="profile-phone"
                        value={user.phone ?? "Not set"}
                        readOnly
                        className="h-11 bg-muted/30"
                      />
                    </FormField>
                    <FormField id="profile-role" label="Primary Role">
                      <Input
                        id="profile-role"
                        value={user.primary_role.replace("_", " ")}
                        readOnly
                        className="h-11 bg-muted/30 capitalize"
                      />
                    </FormField>
                    <FormField id="profile-uuid" label="User ID">
                      <Input id="profile-uuid" value={user.uuid} readOnly className="h-11 bg-muted/30" />
                    </FormField>
                  </div>
                </FormSectionCard>
              ) : null}

              {activeSection === "personal" && profileMode === "customer" ? (
                <FormSectionCard
                  title="Customer Overview"
                  description="Ringkasan cepat untuk aktivitas pelanggan dalam akun yang sama."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                        <Ticket className="size-5" />
                      </div>
                      <p className="mt-4 font-semibold">My Tickets</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Lihat e-ticket, QR code, dan riwayat event.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                        <CreditCard className="size-5" />
                      </div>
                      <p className="mt-4 font-semibold">Transactions</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pantau pembayaran, invoice, dan refund.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                        <ShoppingBag className="size-5" />
                      </div>
                      <p className="mt-4 font-semibold">Discovery</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Jelajahi event baru dari akun yang sama.
                      </p>
                    </div>
                  </div>
                </FormSectionCard>
              ) : null}

              {activeSection === "personal" && profileMode === "creator" ? (
                <FormSectionCard
                  title="Creator Overview"
                  description="Mode creator memakai akun yang sama, tetapi dengan konteks workspace organizer."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                        <LayoutDashboard className="size-5" />
                      </div>
                      <p className="mt-4 font-semibold">Organizer Dashboard</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Akses insight, revenue, dan aktivitas organizer.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                        <CalendarRange className="size-5" />
                      </div>
                      <p className="mt-4 font-semibold">Event Management</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Kelola event, tiket, orders, dan scanner.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                        <Building2 className="size-5" />
                      </div>
                      <p className="mt-4 font-semibold">Active Organizer</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {user.active_organizer?.name ?? "Belum ada organizer aktif."}
                      </p>
                    </div>
                  </div>
                </FormSectionCard>
              ) : null}

              {activeSection === "security" ? (
                <FormSectionCard
                  title="Security"
                  description="Status keamanan akun dan akses yang sedang aktif."
                >
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 size-5 text-brand" />
                        <div>
                          <p className="font-semibold">Email verification</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {user.email_verified
                              ? "Akun Anda sudah terverifikasi."
                              : "Akun Anda belum terverifikasi."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex items-start gap-3">
                        <KeyRound className="mt-0.5 size-5 text-brand" />
                        <div>
                          <p className="font-semibold">Password</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Password management tetap mengikuti flow auth yang sudah ada.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FormSectionCard>
              ) : null}
            </div>
          )}

          {activeSection === "security" && (
            <FormSectionCard
              title="Password"
              description="Bidang password ditampilkan ulang sebagai pengaturan akun premium tanpa mengubah logic."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="current-password" label="Current Password" className="sm:col-span-2">
                  <Input
                    id="current-password"
                    type="password"
                    value="********"
                    readOnly
                    className="h-11 bg-muted/30"
                  />
                </FormField>
                <FormField id="new-password" label="New Password">
                  <Input
                    id="new-password"
                    type="password"
                    value="********"
                    readOnly
                    className="h-11 bg-muted/30"
                  />
                </FormField>
                <FormField id="confirm-password" label="Confirm Password">
                  <Input
                    id="confirm-password"
                    type="password"
                    value="********"
                    readOnly
                    className="h-11 bg-muted/30"
                  />
                </FormField>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Form ini bersifat presentational agar UI profile lengkap tanpa mengubah alur reset/password backend.
              </p>
            </FormSectionCard>
          )}

          {activeSection === "notifications" && (
            <FormSectionCard
              title="Notifications"
              description={
                profileMode === "creator"
                  ? "Preferensi notifikasi untuk workspace creator dan organizer."
                  : "Preferensi notifikasi untuk aktivitas pelanggan."
              }
            >
              <div className="space-y-3">
                {(profileMode === "creator"
                  ? [
                      {
                        id: "notif-organizer",
                        title: "Organizer workspace",
                        description: "Aktivitas membership, approval, dan workspace alerts.",
                        checked: true,
                      },
                      {
                        id: "notif-sales",
                        title: "Sales & orders",
                        description: "Order baru, pembayaran, dan check-in updates.",
                        checked: true,
                      },
                      {
                        id: "notif-marketing-creator",
                        title: "Product updates",
                        description: "Fitur baru untuk creator dan admin tools.",
                        checked: false,
                      },
                    ]
                  : [
                      {
                        id: "notif-email",
                        title: "Email updates",
                        description: "Update pembayaran, tiket, dan perubahan event.",
                        checked: true,
                      },
                      {
                        id: "notif-marketing",
                        title: "Promotions",
                        description: "Promo, referral, dan rekomendasi event.",
                        checked: false,
                      },
                      {
                        id: "notif-event-reminder",
                        title: "Event reminders",
                        description: "Pengingat menjelang event dan update jadwal.",
                        checked: true,
                      },
                    ]
                ).map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4"
                  >
                    <Checkbox checked={item.checked} disabled className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">{item.title}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </FormSectionCard>
          )}

          {activeSection === "accounts" && (
            <FormSectionCard
              title="Connected Accounts"
              description="Akun terhubung ditampilkan tanpa mengubah integrasi sign-in saat ini."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: "Google", desc: "Not connected", icon: Mail },
                  { name: "Apple", desc: "Not connected", icon: MoonStar },
                  { name: "Phone Number", desc: user.phone ?? "Not linked", icon: Smartphone },
                  { name: "Primary Email", desc: user.email, icon: Mail },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 items-center justify-center rounded-2xl bg-background ring-1 ring-border/70">
                            <Icon className="size-4 text-brand" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          View Only
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FormSectionCard>
          )}

          {activeSection === "membership" && (
            <FormSectionCard
              title="Organizer Membership"
              description="Ringkasan akses creator event yang tetap melekat pada akun yang sama."
            >
              <div className="space-y-4">
                {memberships.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center">
                    <p className="font-medium">Belum ada membership organizer</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Membership organizer akan muncul di sini saat akun Anda terhubung ke workspace.
                    </p>
                  </div>
                ) : (
                  memberships.map((organizer) => (
                    <div key={organizer.id} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{organizer.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">@{organizer.slug}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="rounded-full capitalize">
                            {organizer.status}
                          </Badge>
                          {organizer.membership ? (
                            <Badge variant="brand" className="rounded-full capitalize">
                              {organizer.membership.role}
                            </Badge>
                          ) : null}
                          {user.active_organizer?.id === organizer.id ? (
                            <Badge variant="success" className="rounded-full">
                              Active
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </FormSectionCard>
          )}

          {activeSection === "devices" && (
            <FormSectionCard
              title="Devices"
              description="Informasi perangkat aktif yang terdeteksi dari sesi saat ini."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Browser</p>
                  <p className="mt-2 font-semibold">{deviceInfo?.browser ?? "Loading..."}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Platform</p>
                  <p className="mt-2 font-semibold">{deviceInfo?.platform ?? "Loading..."}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Timezone</p>
                  <p className="mt-2 font-semibold">{deviceInfo?.timezone ?? "Loading..."}</p>
                </div>
              </div>
            </FormSectionCard>
          )}

          {activeSection === "sessions" && (
            <FormSectionCard
              title="Sessions"
              description="Tampilan sesi aktif dibuat di atas logic auth saat ini tanpa mengubah perilaku login/logout."
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-brand/20 bg-brand-muted/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{currentSessionLabel}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Sesi ini mengikuti status login aktif dari aplikasi.
                      </p>
                    </div>
                    <Badge variant="success" className="rounded-full">
                      Current Session
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="font-medium">Session management</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Endpoint token/sessions tetap tidak diubah. Bagian ini hanya meningkatkan presentasi area profil.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" disabled>
                      Manage Sessions
                    </Button>
                  </div>
                </div>
              </div>
            </FormSectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
