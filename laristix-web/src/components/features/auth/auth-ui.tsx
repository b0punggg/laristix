import { CheckCircle2, Loader2, MailCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps {
  isLoading?: boolean;
  loadingLabel: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthSubmitButton({
  isLoading,
  loadingLabel,
  children,
  className,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      className={cn("w-full bg-brand hover:bg-brand-hover", className)}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

interface AuthLoadingStateProps {
  message?: string;
  className?: string;
}

export function AuthLoadingState({
  message = "Memuat...",
  className,
}: AuthLoadingStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-10 text-center", className)}
      role="status"
    >
      <Spinner size="lg" label={message} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface AuthSuccessStateProps {
  title: string;
  description: React.ReactNode;
  icon?: React.ElementType;
  children?: React.ReactNode;
}

export function AuthSuccessState({
  title,
  description,
  icon: Icon = CheckCircle2,
  children,
}: AuthSuccessStateProps) {
  return (
    <div className="space-y-5 py-2 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-muted">
        <Icon className="size-8 text-success" aria-hidden />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <div className="text-sm leading-relaxed text-muted-foreground">{description}</div>
      </div>
      {children}
    </div>
  );
}

interface AuthStatusPanelProps {
  status: "loading" | "success" | "error";
  loadingMessage?: string;
  successTitle?: string;
  successMessage?: string;
  errorMessage?: string;
  children?: React.ReactNode;
}

export function AuthStatusPanel({
  status,
  loadingMessage = "Memproses...",
  successTitle = "Berhasil",
  successMessage,
  errorMessage,
  children,
}: AuthStatusPanelProps) {
  if (status === "loading") {
    return <AuthLoadingState message={loadingMessage} />;
  }

  if (status === "success") {
    return (
      <AuthSuccessState
        title={successTitle}
        description={successMessage}
        icon={MailCheck}
      >
        {children}
      </AuthSuccessState>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <Alert variant="danger" title="Terjadi kesalahan">
        {errorMessage}
      </Alert>
      {children}
    </div>
  );
}

interface AuthInlineErrorProps {
  message?: string;
}

export function AuthInlineError({ message }: AuthInlineErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-danger" role="alert">
      <XCircle className="size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function AuthFormDivider({ label = "atau" }: { label?: string }) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-border/70" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-transparent px-2 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function AuthFormFooter({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 pt-2">{children}</div>;
}
