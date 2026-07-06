"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { OrganizerPageHeader } from "@/components/features/organizer/organizer-page-header";
import {
  OrganizerMemberRoleBadge,
  OrganizerMemberStatusBadge,
} from "@/components/features/organizer/organizer-member-badges";
import {
  useInviteOrganizerMemberMutation,
  useOrganizerMembersQuery,
  useRemoveOrganizerMemberMutation,
  useUpdateOrganizerMemberMutation,
} from "@/hooks/use-organizer-members";
import { assignableMemberRoles } from "@/lib/organizer-member-labels";
import { canManageMembers } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { OrganizerMember, OrganizerMemberRole } from "@/types/organizer";

const inviteSchema = z.object({
  email: z.string().email("Masukkan email yang valid."),
  role: z.enum(["admin", "staff", "scanner"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

function MemberRow({ member }: { member: OrganizerMember }) {
  const user = useAuthStore((s) => s.user);
  const updateMember = useUpdateOrganizerMemberMutation();
  const removeMember = useRemoveOrganizerMemberMutation();
  const canManage = canManageMembers(user);
  const isOwner = member.role === "owner";
  const isSelf = member.user?.id === user?.id;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 py-4">
      <div className="min-w-0 space-y-1">
        <p className="font-medium">{member.user?.name ?? "—"}</p>
        <p className="text-sm text-muted-foreground">{member.user?.email}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <OrganizerMemberRoleBadge role={member.role} />
          <OrganizerMemberStatusBadge status={member.status} />
        </div>
      </div>

      {canManage && !isOwner ? (
        <div className="flex flex-wrap items-center gap-2">
          {member.status === "pending" ? (
            <Button
              size="sm"
              variant="outline"
              disabled={updateMember.isPending}
              onClick={() =>
                updateMember.mutate({ memberId: member.id, payload: { status: "active" } })
              }
            >
              Aktifkan
            </Button>
          ) : null}
          <Select
            value={member.role}
            disabled={updateMember.isPending || isSelf}
            onChange={(e) =>
              updateMember.mutate({
                memberId: member.id,
                payload: { role: e.target.value as OrganizerMemberRole },
              })
            }
            className="w-28"
          >
            {assignableMemberRoles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {member.role === "owner" ? <option value="owner">Owner</option> : null}
          </Select>
          {!isSelf ? (
            <Button
              size="sm"
              variant="outline"
              disabled={removeMember.isPending}
              onClick={() => removeMember.mutate(member.id)}
            >
              Hapus
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function OrganizerMembersPanel() {
  const user = useAuthStore((s) => s.user);
  const canManage = canManageMembers(user);
  const membersQuery = useOrganizerMembersQuery(canManage);
  const inviteMember = useInviteOrganizerMemberMutation();
  const [showInviteForm, setShowInviteForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "staff" },
  });

  if (!canManage) {
    return (
      <EmptyState
        icon={Users}
        title="Akses terbatas"
        description="Hanya owner atau admin yang dapat mengelola anggota tim."
      />
    );
  }

  const onInvite = handleSubmit((values) => {
    inviteMember.mutate(values, {
      onSuccess: () => {
        reset({ email: "", role: "staff" });
        setShowInviteForm(false);
      },
    });
  });

  return (
    <div className="space-y-6">
      <OrganizerPageHeader
        title="Tim"
        description="Undang staf atau scanner. Anggota harus sudah punya akun Laristix dengan email yang sama."
        actions={
          <Button size="sm" onClick={() => setShowInviteForm((open) => !open)}>
            <UserPlus className="mr-2 size-4" />
            Undang anggota
          </Button>
        }
      />

      {showInviteForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Undang anggota baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onInvite} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="staf@example.com"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  User harus sudah terdaftar. Mereka akan menerima email undangan dan bisa menerima
                  dari halaman pilih organizer.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Peran</Label>
                <Select id="invite-role" {...register("role")} className="w-full sm:w-32">
                  {assignableMemberRoles.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit" disabled={inviteMember.isPending}>
                {inviteMember.isPending ? "Mengirim..." : "Kirim undangan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anggota tim</CardTitle>
        </CardHeader>
        <CardContent>
          {membersQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : membersQuery.isError ? (
            <EmptyState
              icon={Users}
              title="Gagal memuat anggota"
              description="Periksa koneksi lalu coba lagi."
            >
              <Button variant="outline" size="sm" onClick={() => membersQuery.refetch()}>
                Coba lagi
              </Button>
            </EmptyState>
          ) : (membersQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada anggota tim.</p>
          ) : (
            <div className="divide-y">
              {membersQuery.data?.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
