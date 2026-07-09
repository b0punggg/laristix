"use client";

export interface EventFinanceSettings {
  quotation_amount: number;
  quotation_description: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseEventFinanceSettings(
  settings: Record<string, unknown> | null | undefined,
): EventFinanceSettings {
  const finance = asRecord(settings?.finance);

  return {
    quotation_amount:
      typeof finance?.quotation_amount === "number"
        ? Math.max(0, finance.quotation_amount)
        : Number(finance?.quotation_amount ?? 0) || 0,
    quotation_description: asString(finance?.quotation_description),
  };
}

export function applyFinanceSettings(
  existing: Record<string, unknown>,
  finance: EventFinanceSettings,
): Record<string, unknown> {
  const next = { ...existing };
  const amount = Math.max(0, Number(finance.quotation_amount) || 0);
  const description = finance.quotation_description.trim();

  if (amount <= 0 && description.length === 0) {
    delete next.finance;
    return next;
  }

  next.finance = {
    quotation_amount: amount,
    ...(description ? { quotation_description: description } : {}),
  };

  return next;
}
