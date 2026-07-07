import type { AuthShellVariant } from "@/components/layouts/auth-shell";
import { AuthShell } from "@/components/layouts/auth-shell";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  variant?: AuthShellVariant;
  wide?: boolean;
}

export function AuthLayout({
  children,
  title,
  description,
  variant = "login",
  wide = false,
}: AuthLayoutProps) {
  return (
    <AuthShell title={title} description={description} variant={variant} wide={wide}>
      {children}
    </AuthShell>
  );
}
