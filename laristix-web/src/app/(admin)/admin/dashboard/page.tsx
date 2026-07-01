import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/env";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Platform administration area. Manage organizers, events, and global settings.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-bold">Platform-wide</p>
            <Button asChild size="sm">
              <Link href={routes.adminEvents}>View all events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Organizers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">Approval UI coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
