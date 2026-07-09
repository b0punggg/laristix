"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { adminApi } from "@/services/admin/admin-api";
import type {
  AdminWithdrawalDocumentType,
  AdminWithdrawal,
  DefaultPlatformFeeSetting,
  MaintenanceModeSetting,
  StoreOrganizerFeeConfigPayload,
  UpdateAdminWithdrawalPayload,
} from "@/types/admin";

export const adminSettingsKeys = {
  all: ["admin", "settings"] as const,
  withdrawals: ["admin", "withdrawals"] as const,
  feeConfigs: (uuid: string) => ["admin", "organizers", uuid, "fee-configs"] as const,
};

export function usePlatformSettingsQuery() {
  return useQuery({
    queryKey: adminSettingsKeys.all,
    queryFn: () => adminApi.listSettings(),
    staleTime: 30_000,
  });
}

export function useUpdateMaintenanceModeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: MaintenanceModeSetting) =>
      adminApi.updateSetting("maintenance_mode", value),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: adminSettingsKeys.all });
      toast.success(response.message ?? "Maintenance mode updated.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update maintenance mode."));
    },
  });
}

export function useUpdateDefaultFeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: DefaultPlatformFeeSetting) =>
      adminApi.updateSetting("default_platform_fee", value),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: adminSettingsKeys.all });
      toast.success(response.message ?? "Default platform fee updated.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update default fee."));
    },
  });
}

export function useOrganizerFeeConfigsQuery(organizerUuid: string, enabled = true) {
  return useQuery({
    queryKey: adminSettingsKeys.feeConfigs(organizerUuid),
    queryFn: () => adminApi.listOrganizerFeeConfigs(organizerUuid),
    enabled: enabled && organizerUuid.length > 0,
  });
}

export function useAdminWithdrawalsQuery() {
  return useQuery({
    queryKey: adminSettingsKeys.withdrawals,
    queryFn: () => adminApi.listWithdrawals(),
    staleTime: 15_000,
  });
}

export function useUpdateAdminWithdrawalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: UpdateAdminWithdrawalPayload }) =>
      adminApi.updateWithdrawal(uuid, payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: adminSettingsKeys.withdrawals });
      toast.success(response.message ?? "Withdrawal updated.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update withdrawal."));
    },
  });
}

export function useUploadAdminWithdrawalDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      type,
      file,
    }: {
      uuid: string;
      type: AdminWithdrawalDocumentType;
      file: File;
    }) => adminApi.uploadWithdrawalDocument(uuid, type, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminSettingsKeys.withdrawals });
      toast.success("Dokumen payout berhasil diunggah.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to upload withdrawal document."));
    },
  });
}

export function useCreateOrganizerFeeConfigMutation(organizerUuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StoreOrganizerFeeConfigPayload) =>
      adminApi.createOrganizerFeeConfig(organizerUuid, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: adminSettingsKeys.feeConfigs(organizerUuid) });
      toast.success(response.message ?? "Fee config created.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create fee config."));
    },
  });
}

export function useDeleteOrganizerFeeConfigMutation(organizerUuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feeConfigId: number) =>
      adminApi.deleteOrganizerFeeConfig(organizerUuid, feeConfigId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: adminSettingsKeys.feeConfigs(organizerUuid) });
      toast.success(response.message ?? "Fee config deleted.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete fee config."));
    },
  });
}
