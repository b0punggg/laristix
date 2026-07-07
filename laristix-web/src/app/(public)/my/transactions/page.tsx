import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { OrdersPanel } from "@/components/features/orders/orders-panel";

function MyTransactionsPageContent() {
  return (
    <AuthGuard requireEmailVerified={false} preserveReturnUrl>
      <OrdersPanel />
    </AuthGuard>
  );
}

export default function MyTransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Memuat...
        </div>
      }
    >
      <MyTransactionsPageContent />
    </Suspense>
  );
}
