"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthFormFooter, AuthSubmitButton } from "@/components/features/auth/auth-ui";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useResetPasswordMutation } from "@/hooks/use-auth";

const schema = z
  .object({
    email: z.string().email(),
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters."),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const reset = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      token: searchParams.get("token") ?? "",
    },
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit((values) => reset.mutate(values))}>
      <input type="hidden" {...register("token")} />

      <FormField id="email" label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" className="h-11" {...register("email")} />
      </FormField>

      <FormField
        id="password"
        label="New password"
        required
        helpText="Minimal 8 karakter."
        error={errors.password?.message}
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder="Password baru"
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
          placeholder="Ulangi password baru"
          className="h-11"
          {...register("password_confirmation")}
        />
      </FormField>

      <AuthFormFooter>
        <AuthSubmitButton isLoading={reset.isPending} loadingLabel="Resetting...">
          Reset password
        </AuthSubmitButton>
      </AuthFormFooter>
    </form>
  );
}
