"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { eventKeys } from "@/hooks/use-events";
import { phaseCApi } from "@/services/phase-c/phase-c-api";
import type { RegistrationField } from "@/types/phase-c";
import type { SubmitOrganizerCompliancePayload } from "@/types/phase-c";

export const phaseCKeys = {
  tags: ["event-tags"] as const,
  compliance: ["organizer-compliance"] as const,
  registrationForm: (eventUuid: string) => ["registration-form", eventUuid] as const,
  publicRegistrationForm: (eventUuid: string) => ["public-registration-form", eventUuid] as const,
};

export function useEventTagsQuery() {
  return useQuery({
    queryKey: phaseCKeys.tags,
    queryFn: () => phaseCApi.listTags(),
  });
}

export function useCreateEventTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => phaseCApi.createTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phaseCKeys.tags });
      toast.success("Tag berhasil ditambahkan.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useOrganizerComplianceQuery() {
  return useQuery({
    queryKey: phaseCKeys.compliance,
    queryFn: () => phaseCApi.getCompliance(),
  });
}

export function useSubmitComplianceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitOrganizerCompliancePayload) => phaseCApi.submitCompliance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phaseCKeys.compliance });
      toast.success("Data verifikasi berhasil dikirim.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useRegistrationFormQuery(eventUuid: string) {
  return useQuery({
    queryKey: phaseCKeys.registrationForm(eventUuid),
    queryFn: () => phaseCApi.getRegistrationForm(eventUuid),
    enabled: eventUuid.length > 0,
  });
}

export function usePublicRegistrationFormQuery(eventUuid: string) {
  return useQuery({
    queryKey: phaseCKeys.publicRegistrationForm(eventUuid),
    queryFn: () => phaseCApi.getPublicRegistrationForm(eventUuid),
    enabled: eventUuid.length > 0,
  });
}

export function useSyncRegistrationFieldsMutation(eventUuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fields: RegistrationField[]) => phaseCApi.syncRegistrationFields(eventUuid, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phaseCKeys.registrationForm(eventUuid) });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventUuid) });
      toast.success("Formulir pendaftaran disimpan.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
