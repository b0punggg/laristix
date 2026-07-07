import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Text } from "@/design-system/primitives/text";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Kami tidak dapat memuat data. Silakan coba lagi.",
  icon: Icon = AlertCircle,
  onRetry,
  retryLabel = "Coba lagi",
  className,
  children,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center py-12 text-center", className)} role="alert">
      <Alert variant="danger" className="max-w-lg text-left" title={title}>
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
          <div>
            <Text variant="body-md">{description}</Text>
            {children}
            {onRetry ? (
              <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
                {retryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </Alert>
    </div>
  );
}
