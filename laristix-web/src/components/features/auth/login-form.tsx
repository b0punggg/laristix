"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthFormFooter, AuthSubmitButton } from "@/components/features/auth/auth-ui";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { routes } from "@/config/env";
import { useLoginMutation } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const login = useLoginMutation(redirectTo);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit((values) => login.mutate(values))}>
      <FormField id="email" label="Email" required error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          className="h-11"
          {...register("email")}
        />
      </FormField>

      <FormField id="password" label="Password" required error={errors.password?.message}>
        <PasswordInput
          autoComplete="current-password"
          placeholder="Masukkan password"
          className="h-11"
          {...register("password")}
        />
      </FormField>

      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
          <Controller
            name="remember"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          Remember me
        </label>
        <Link
          href={routes.forgotPassword}
          className="text-sm font-medium text-brand hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <AuthFormFooter>
        <AuthSubmitButton isLoading={login.isPending} loadingLabel="Signing in...">
          Sign in
        </AuthSubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href={
              redirectTo
                ? `${routes.register}?redirect=${encodeURIComponent(redirectTo)}`
                : routes.register
            }
            className="font-medium text-brand hover:underline"
          >
            Create account
          </Link>
        </p>
      </AuthFormFooter>
    </form>
  );
}
