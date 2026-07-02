import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { TransactionsPanel } from "@/components/features/transactions/transactions-panel";

function MyTransactionsPageContent() {
  return (
    <AuthGuard requireEmailVerified={false} preserveReturnUrl>
      <TransactionsPanel />
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
