"use client";

import { useQuery } from "@tanstack/react-query";
import { apiPaths } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import type { OrganizerFeePreview } from "@/lib/event-checkout-settings";

export const organizerFeePreviewKeys = {
  all: ["organizer-fee-preview"] as const,
  detail: (params: { subtotal: number; fee_bearer: string }) =>
    ["organizer-fee-preview", params] as const,
};

interface FeePreviewParams {
  subtotal?: number;
  fee_bearer?: string;
}

export function useOrganizerFeePreviewQuery(params: FeePreviewParams, enabled = true) {
  return useQuery({
    queryKey: organizerFeePreviewKeys.detail({
      subtotal: params.subtotal ?? 100000,
      fee_bearer: params.fee_bearer ?? "attendee",
    }),
    queryFn: async () => {
      const search = new URLSearchParams();
      if (params.subtotal !== undefined) {
        search.set("subtotal", String(params.subtotal));
      }
      if (params.fee_bearer) {
        search.set("fee_bearer", params.fee_bearer);
      }

      const response = await apiClient.get<{ data: OrganizerFeePreview }>(
        `${apiPaths.organizers.feePreview}?${search.toString()}`,
      );

      return response.data.data;
    },
    enabled,
  });
}
