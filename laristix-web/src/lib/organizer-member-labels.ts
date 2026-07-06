import type { OrganizerMemberRole, OrganizerMemberStatus } from "@/types/organizer";

const roleLabels: Record<OrganizerMemberRole, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staf",
  scanner: "Scanner",
};

const statusLabels: Record<OrganizerMemberStatus, string> = {
  pending: "Menunggu",
  active: "Aktif",
  removed: "Dihapus",
};

export function organizerMemberRoleLabel(role: OrganizerMemberRole): string {
  return roleLabels[role] ?? role;
}

export function organizerMemberStatusLabel(status: OrganizerMemberStatus): string {
  return statusLabels[status] ?? status;
}

export const assignableMemberRoles: Array<{
  value: Exclude<OrganizerMemberRole, "owner">;
  label: string;
}> = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staf" },
  { value: "scanner", label: "Scanner" },
];
