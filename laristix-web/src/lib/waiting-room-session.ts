const STORAGE_PREFIX = "laristix_queue_session_";

export function getQueueSessionToken(eventUuid: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(`${STORAGE_PREFIX}${eventUuid}`);
}

export function setQueueSessionToken(eventUuid: string, sessionToken: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${STORAGE_PREFIX}${eventUuid}`, sessionToken);
}

export function clearQueueSessionToken(eventUuid: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(`${STORAGE_PREFIX}${eventUuid}`);
}
