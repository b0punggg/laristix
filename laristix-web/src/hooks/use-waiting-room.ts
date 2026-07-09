"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { waitingRoomApi } from "@/services/waiting-room/waiting-room-api";
import type { JoinWaitingRoomPayload } from "@/types/waiting-room";

export const waitingRoomKeys = {
  all: ["waiting-room"] as const,
  status: (eventUuid: string, sessionToken?: string) =>
    ["waiting-room", "status", eventUuid, sessionToken ?? ""] as const,
};

export function useWaitingRoomStatusQuery(
  eventUuid: string,
  sessionToken?: string,
  enabled = true,
  pollIntervalSeconds = 3,
) {
  return useQuery({
    queryKey: waitingRoomKeys.status(eventUuid, sessionToken),
    queryFn: () => waitingRoomApi.status(eventUuid, sessionToken),
    enabled: enabled && eventUuid.length > 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) {
        return pollIntervalSeconds * 1000;
      }

      if (data.admitted) {
        return false;
      }

      return (data.poll_interval_seconds || pollIntervalSeconds) * 1000;
    },
  });
}

export function useJoinWaitingRoomMutation(eventUuid: string) {
  return useMutation({
    mutationFn: (payload: JoinWaitingRoomPayload) => waitingRoomApi.join(eventUuid, payload),
  });
}
