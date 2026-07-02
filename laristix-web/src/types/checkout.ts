export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "completed"
  | "expired"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type PaymentStatusLabel = "pending" | "paid" | "failed" | "expired" | "refunded";

export interface CheckoutOrderEventVenue {
  name: string;
  city: string | null;
  province: string | null;
  address: string | null;
}

export interface CheckoutOrderEventCategory {
  name: string;
  slug: string;
}

export interface CheckoutOrderEvent {
  uuid: string;
  title: string;
  slug: string;
  banner_url?: string | null;
  start_at?: string;
  end_at?: string;
  timezone?: string;
  venue?: CheckoutOrderEventVenue | null;
  category?: CheckoutOrderEventCategory | null;
}

export interface CheckoutOrderItem {
  id: number;
  ticket_type_id: number;
  ticket_type_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface CheckoutPayment {
  uuid: string;
  gateway: string;
  gateway_transaction_id: string;
  payment_method: string | null;
  status: string;
  status_label: PaymentStatusLabel;
  amount: number;
  currency: string;
  paid_at: string | null;
  expired_at: string | null;
}

export interface CheckoutRegistration {
  uuid: string;
  seat_index: number;
  attendee_name: string | null;
  attendee_email: string | null;
  status: string;
  ticket_type_id?: number;
  ticket_type_name?: string | null;
  ticket?: {
    uuid: string;
    ticket_code: string;
    status: string;
    issued_at: string;
    checked_in_at?: string | null;
  } | null;
}

export interface CheckoutOrder {
  uuid: string;
  order_number: string;
  status: OrderStatus;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  currency: string;
  subtotal: number;
  discount_amount: number;
  platform_fee_total: number;
  total_amount: number;
  expires_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  event?: CheckoutOrderEvent;
  items: CheckoutOrderItem[];
  payment?: CheckoutPayment | null;
  registrations: CheckoutRegistration[];
  created_at: string;
}

export interface CheckoutResponse {
  order: CheckoutOrder;
  snap_token: string | null;
  client_key: string | null;
}

export interface CreateCheckoutPayload {
  ticket_type_id: number;
  quantity: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
}

export interface PaymentValidationResult {
  valid: boolean;
  payment_status: PaymentStatusLabel;
  order_status: OrderStatus;
  message: string;
}
