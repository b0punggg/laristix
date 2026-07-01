"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/env";
import { useAttendanceStatsQuery, useCheckInListQuery } from "@/hooks/use-check-in";

interface AttendanceDashboardProps {
  eventUuid: string;
  eventTitle?: string;
}

export function AttendanceDashboard({ eventUuid, eventTitle }: AttendanceDashboardProps) {
  const statsQuery = useAttendanceStatsQuery(eventUuid);
  const listQuery = useCheckInListQuery(eventUuid);
  const stats = statsQuery.data;
  const checkIns = listQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Dashboard Kehadiran</h2>
          {eventTitle ? <p className="text-sm text-muted-foreground">{eventTitle}</p> : null}
        </div>
        <Button asChild variant="outline">
          <Link href={routes.scanner}>Buka scanner</Link>
        </Button>
      </div>

      {statsQuery.isLoading ? <p className="text-muted-foreground">Memuat statistik...</p> : null}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total tiket" value={stats.total_tickets} />
          <StatCard label="Sudah check-in" value={stats.checked_in} />
          <StatCard label="Belum hadir" value={stats.remaining} />
          <StatCard label="Tingkat kehadiran" value={`${stats.check_in_rate}%`} />
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Check-in terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat daftar...</p>
          ) : checkIns.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada check-in.</p>
          ) : (
            <ul className="divide-y">
              {checkIns.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.ticket?.ticket_code ?? "-"}</p>
                    <p className="text-muted-foreground">
                      {item.attendee?.name ?? item.attendee?.email ?? "Peserta"}
                    </p>
                  </div>
                  <div className="text-right text-muted-foreground">
                    <p>{item.method}</p>
                    <p>{new Date(item.checked_in_at).toLocaleString("id-ID")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
