"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthFormFooter, AuthSubmitButton } from "@/components/features/auth/auth-ui";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { routes } from "@/config/env";
import { useRegisterMutation } from "@/hooks/use-auth";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Enter a valid email."),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const registerUser = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit((values) => registerUser.mutate(values))}>
      <FormField id="name" label="Full name" required error={errors.name?.message}>
        <Input autoComplete="name" placeholder="Nama lengkap" className="h-11" {...register("name")} />
      </FormField>

      <FormField id="email" label="Email" required error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          className="h-11"
          {...register("email")}
        />
      </FormField>

      <FormField
        id="phone"
        label="Phone (optional)"
        helpText="Digunakan untuk notifikasi tiket dan pembayaran."
        error={errors.phone?.message}
      >
        <Input type="tel" autoComplete="tel" placeholder="+62..." className="h-11" {...register("phone")} />
      </FormField>

      <FormField
        id="password"
        label="Password"
        required
        helpText="Minimal 8 karakter."
        error={errors.password?.message}
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder="Buat password"
          className="h-11"
          {...register("password")}
        />
      </FormField>

      <FormField
        id="password_confirmation"
        label="Confirm password"
        required
        error={errors.password_confirmation?.message}
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder="Ulangi password"
          className="h-11"
          {...register("password_confirmation")}
        />
      </FormField>

      <AuthFormFooter>
        <AuthSubmitButton isLoading={registerUser.isPending} loadingLabel="Creating account...">
          Create account
        </AuthSubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={routes.login} className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </AuthFormFooter>
    </form>
  );
}
