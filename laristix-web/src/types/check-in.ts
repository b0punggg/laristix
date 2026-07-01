export type CheckInMethod = "qr_scan" | "manual" | "api";

export interface CheckInGate {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface CheckInRecord {
  id: number;
  method: CheckInMethod;
  checked_in_at: string;
  device_info: string | null;
  ticket?: {
    uuid: string;
    ticket_code: string;
    ticket_type?: string;
  };
  attendee?: {
    name: string | null;
    email: string | null;
  };
  gate?: {
    id: number;
    name: string;
    code: string;
  } | null;
  scanner?: {
    id: number;
    name: string;
  };
}

export interface CheckInVerifyResult {
  valid: boolean;
  ticket: {
    uuid: string;
    ticket_code: string;
    status: string;
    ticket_type?: string;
    attendee_name?: string | null;
    attendee_email?: string | null;
    checked_in_at?: string | null;
  } | null;
  message: string;
}

export interface AttendanceStats {
  total_tickets: number;
  checked_in: number;
  remaining: number;
  check_in_rate: number;
  by_method: Record<string, number>;
}

export interface TicketQrPayload {
  ticket_uuid: string;
  ticket_code: string;
  qr_payload: string;
  event_uuid: string | null;
  status: string;
}
