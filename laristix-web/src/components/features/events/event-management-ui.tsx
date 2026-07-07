"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/primitives/text";

export interface FormWizardStep {
  id: string;
  label: string;
  description?: string;
}

interface FormWizardProgressProps {
  steps: FormWizardStep[];
  currentStep: number;
  className?: string;
}

export function FormWizardProgress({ steps, currentStep, className }: FormWizardProgressProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={step.id} className="flex flex-1 items-center gap-3 sm:flex-col sm:items-start">
              <div className="flex items-center gap-3 sm:w-full">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isComplete && "border-brand bg-brand text-brand-foreground",
                    isCurrent && "border-brand bg-brand-muted text-brand",
                    !isComplete && !isCurrent && "border-border text-muted-foreground",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="size-4" aria-hidden /> : index + 1}
                </span>
                <div className="min-w-0 sm:hidden">
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                </div>
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                {step.description ? (
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                ) : null}
              </div>
              {index < steps.length - 1 ? (
                <div
                  className="ml-4 hidden h-px flex-1 bg-border sm:ml-0 sm:mt-3 sm:block sm:h-0.5 sm:w-full"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface FormSaveIndicatorProps {
  isDirty?: boolean;
  isSaving?: boolean;
  lastSaved?: boolean;
  className?: string;
}

export function FormSaveIndicator({
  isDirty,
  isSaving,
  lastSaved,
  className,
}: FormSaveIndicatorProps) {
  let label = "Semua perubahan tersimpan";
  let dotClass = "bg-success";

  if (isSaving) {
    label = "Menyimpan...";
    dotClass = "bg-amber-500 animate-pulse";
  } else if (isDirty) {
    label = "Perubahan belum disimpan";
    dotClass = "bg-amber-500";
  } else if (!lastSaved) {
    label = "Siap disimpan";
    dotClass = "bg-muted-foreground";
  }

  return (
    <div
      className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      <Circle className={cn("size-2 fill-current", dotClass)} aria-hidden />
      <span>{label}</span>
    </div>
  );
}

interface FormSectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSectionCard({ title, description, children, className }: FormSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="mb-5 space-y-1">
        <Text variant="h4">{title}</Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </div>
      {children}
    </section>
  );
}

interface FormTabButtonProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

export function FormTabButton({ active, children, onClick }: FormTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "ds-focus-ring shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand text-brand-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
