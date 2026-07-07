"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AuthFormFooter,
  AuthSubmitButton,
  AuthSuccessState,
} from "@/components/features/auth/auth-ui";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/env";
import { useForgotPasswordMutation } from "@/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const forgot = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (forgot.isSuccess) {
    return (
      <AuthSuccessState
        title="Periksa email Anda"
        description={
          <>
            Jika akun dengan email <strong>{getValues("email")}</strong> terdaftar, kami telah
            mengirimkan tautan reset password. Periksa folder spam jika tidak muncul dalam beberapa
            menit.
          </>
        }
      >
        <Link
          href={routes.login}
          className="inline-flex text-sm font-medium text-brand hover:underline"
        >
          Kembali ke sign in
        </Link>
      </AuthSuccessState>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit((values) => forgot.mutate(values))}>
      <FormField
        id="email"
        label="Email"
        required
        helpText="Kami akan mengirim tautan reset ke email ini."
        error={errors.email?.message}
      >
        <Input
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          className="h-11"
          {...register("email")}
        />
      </FormField>

      <AuthFormFooter>
        <AuthSubmitButton isLoading={forgot.isPending} loadingLabel="Sending...">
          Send reset link
        </AuthSubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          <Link href={routes.login} className="font-medium text-brand hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthFormFooter>
    </form>
  );
}
