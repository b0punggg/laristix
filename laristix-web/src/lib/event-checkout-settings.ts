export type CheckoutFeeBearer = "attendee" | "organizer";

export type CheckoutBuyerFieldKey =
  | "name"
  | "email"
  | "phone"
  | "id_number"
  | "date_of_birth"
  | "gender";

export interface CheckoutBuyerFieldConfig {
  enabled: boolean;
  required: boolean;
}

export type CheckoutBuyerFields = Record<CheckoutBuyerFieldKey, CheckoutBuyerFieldConfig>;

export interface EventCheckoutSettings {
  max_tickets_per_transaction: number | null;
  one_email_per_transaction: boolean;
  one_attendee_per_ticket: boolean;
  fee_bearer: CheckoutFeeBearer | null;
  buyer_fields: CheckoutBuyerFields;
}

export const DEFAULT_CHECKOUT_BUYER_FIELDS: CheckoutBuyerFields = {
  name: { enabled: true, required: true },
  email: { enabled: true, required: true },
  phone: { enabled: true, required: false },
  id_number: { enabled: false, required: false },
  date_of_birth: { enabled: false, required: false },
  gender: { enabled: false, required: false },
};

export const CHECKOUT_BUYER_FIELD_LABELS: Record<CheckoutBuyerFieldKey, string> = {
  name: "Nama lengkap",
  email: "Email",
  phone: "No. telepon",
  id_number: "No. KTP",
  date_of_birth: "Tanggal lahir",
  gender: "Jenis kelamin",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseBuyerFields(raw: unknown): CheckoutBuyerFields {
  const source = asRecord(raw) ?? {};
  const fields = { ...DEFAULT_CHECKOUT_BUYER_FIELDS };

  (Object.keys(fields) as CheckoutBuyerFieldKey[]).forEach((key) => {
    const field = asRecord(source[key]);
    if (!field) {
      return;
    }

    const enabled = typeof field.enabled === "boolean" ? field.enabled : fields[key].enabled;
    const required = typeof field.required === "boolean" ? field.required : fields[key].required;

    if (key === "name" || key === "email") {
      fields[key] = { enabled: true, required: true };
      return;
    }

    fields[key] = {
      enabled,
      required: enabled && required,
    };
  });

  return fields;
}

export function parseEventCheckoutSettings(
  settings: Record<string, unknown> | null | undefined,
): EventCheckoutSettings {
  const checkout = asRecord(settings?.checkout) ?? {};
  const maxRaw = checkout.max_tickets_per_transaction;
  const feeBearer = checkout.fee_bearer;

  return {
    max_tickets_per_transaction:
      typeof maxRaw === "number" && maxRaw >= 1 ? Math.floor(maxRaw) : null,
    one_email_per_transaction: checkout.one_email_per_transaction === true,
    one_attendee_per_ticket: checkout.one_attendee_per_ticket === true,
    fee_bearer:
      feeBearer === "attendee" || feeBearer === "organizer" ? feeBearer : null,
    buyer_fields: parseBuyerFields(checkout.buyer_fields),
  };
}

export function buildEventCheckoutSettingsPatch(
  settings: EventCheckoutSettings,
): Record<string, unknown> {
  return {
    max_tickets_per_transaction: settings.max_tickets_per_transaction,
    one_email_per_transaction: settings.one_email_per_transaction,
    one_attendee_per_ticket: settings.one_attendee_per_ticket,
    fee_bearer: settings.fee_bearer,
    buyer_fields: settings.buyer_fields,
  };
}

export function applyCheckoutSettings(
  existing: Record<string, unknown> | null,
  checkout: EventCheckoutSettings,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...(existing ?? {}) };
  next.checkout = buildEventCheckoutSettingsPatch(checkout);

  return next;
}

export interface CheckoutAttendeePayload {
  name: string;
  email?: string;
  phone?: string;
  id_number?: string;
  date_of_birth?: string;
  gender?: string;
  answers?: Array<{ field_id: number; value: string | boolean | null }>;
}

export interface CheckoutQuote {
  subtotal: number;
  platform_fee_pct_rate: number;
  platform_fee_flat: number;
  platform_fee_total: number;
  fee_bearer: CheckoutFeeBearer;
  total_amount: number;
  organizer_net_amount: number;
}

export interface OrganizerFeePreview {
  percentage_rate: number;
  flat_amount: number;
  fee_bearer: CheckoutFeeBearer;
  source: string;
  subtotal: number;
  platform_fee_total: number;
  total_amount: number;
  organizer_net_amount: number;
}

export function simulateCheckoutPricing(
  subtotal: number,
  percentageRate: number,
  flatAmount: number,
  feeBearer: CheckoutFeeBearer,
): Pick<CheckoutQuote, "platform_fee_total" | "total_amount" | "organizer_net_amount"> {
  const platformFeeTotal = Math.round(subtotal * (percentageRate / 100) + flatAmount);
  const totalAmount = feeBearer === "attendee" ? subtotal + platformFeeTotal : subtotal;
  const organizerNet = feeBearer === "organizer" ? subtotal - platformFeeTotal : subtotal;

  return {
    platform_fee_total: Math.max(0, platformFeeTotal),
    total_amount: Math.max(0, totalAmount),
    organizer_net_amount: Math.max(0, organizerNet),
  };
}
