import { AdminOrganizerDetailPanel } from "@/components/features/admin/admin-organizer-detail-panel";

interface AdminOrganizerDetailPageProps {
  params: { uuid: string };
}

export default function AdminOrganizerDetailPage({ params }: AdminOrganizerDetailPageProps) {
  return <AdminOrganizerDetailPanel uuid={params.uuid} />;
}
