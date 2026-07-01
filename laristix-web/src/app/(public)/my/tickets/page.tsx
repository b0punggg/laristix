import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { MyTicketsPanel } from "@/components/features/my-tickets/my-tickets-panel";

function MyTicketsPageContent() {
  return (
    <AuthGuard requireEmailVerified={false} preserveReturnUrl>
      <MyTicketsPanel />
    </AuthGuard>
  );
}

export default function MyTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Memuat...
        </div>
      }
    >
      <MyTicketsPageContent />
    </Suspense>
  );
}
