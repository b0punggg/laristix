export type WaitingRoomStatus = "inactive" | "waiting" | "admitted" | "expired";

export interface WaitingRoomState {
  queue_active: boolean;
  session_token: string | null;
  status: WaitingRoomStatus;
  admitted: boolean;
  position: number | null;
  waiting_ahead: number | null;
  waiting_count: number;
  admitted_count: number;
  estimated_wait_seconds: number | null;
  admission_expires_at: string | null;
  poll_interval_seconds: number;
  admission_token_ttl_seconds: number;
  order_ttl_minutes: number;
}

export interface JoinWaitingRoomPayload {
  session_token?: string;
  ticket_type_id?: number;
  quantity?: number;
}
