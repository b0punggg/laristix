"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { routes } from "@/config/env";
import { readRedirectSearchParam } from "@/lib/create-event-funnel";
import { createEventOnboardingTarget } from "@/lib/public-create-event-data";
import { useCreateOrganizerMutation } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email."),
  slug: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  description: z.string().max(5000).optional(),
  website: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
  timezone: z.string().min(1),
});

type CreateOrganizerFormValues = z.infer<typeof schema>;

const timezones = [
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Bangkok",
  "Asia/Makassar",
  "Asia/Jayapura",
  "UTC",
];

export function CreateOrganizerForm() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const nextPath = readRedirectSearchParam(searchParams) ?? createEventOnboardingTarget;
  const createOrganizer = useCreateOrganizerMutation(nextPath);
  const isOnboarding = nextPath.includes("onboarding=1");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrganizerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: user?.email ?? "",
      slug: "",
      phone: user?.phone ?? "",
      description: "",
      website: "",
      timezone: "Asia/Jakarta",
    },
  });

  useEffect(() => {
    if (user?.email) {
      reset((current) => ({
        ...current,
        email: user.email,
        phone: user.phone ?? "",
      }));
    }
  }, [user, reset]);

  return (
    <Card>
      <form
        onSubmit={handleSubmit((values) =>
          createOrganizer.mutate({
            name: values.name,
            email: values.email,
            slug: values.slug || undefined,
            phone: values.phone || undefined,
            description: values.description || undefined,
            website: values.website || undefined,
            timezone: values.timezone,
          }),
        )}
      >
        <CardContent className="space-y-4 pt-6">
          {isOnboarding ? (
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Langkah 1 dari 2</p>
              <p className="mt-1">
                Buat workspace organizer dulu, lalu lanjut ke form event pertama Anda — target
                selesai dalam sekitar 5 menit.
              </p>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="name">Nama organizer *</Label>
            <Input id="name" placeholder="Nama brand atau tim event" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email kontak *</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input id="slug" placeholder="my-event-company" {...register("slug")} />
              {errors.slug ? (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor telepon</Label>
              <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" {...register("phone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select id="timezone" {...register("timezone")}>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input id="website" type="url" placeholder="https://..." {...register("website")} />
            {errors.website ? (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <p className="text-xs text-muted-foreground">
            Anda akan menjadi owner organizer ini. Akun dapat memerlukan persetujuan platform
            sebelum event dipublikasikan.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={createOrganizer.isPending}>
            {createOrganizer.isPending
              ? "Membuat..."
              : isOnboarding
                ? "Lanjut buat event"
                : "Buat organizer"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an organizer?{" "}
            <Link href={routes.selectOrganizer} className="text-primary hover:underline">
              Select workspace
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
