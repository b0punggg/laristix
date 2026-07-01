import { AttendanceDashboard } from "@/components/features/check-in/attendance-dashboard";

interface AttendancePageProps {
  params: { uuid: string };
}

export default function AttendancePage({ params }: AttendancePageProps) {
  return <AttendanceDashboard eventUuid={params.uuid} />;
}
