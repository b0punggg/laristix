import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { CheckoutFinishPanel } from "@/components/features/checkout/checkout-finish-panel";

interface CheckoutFinishPageProps {
  params: { uuid: string };
}

function CheckoutFinishPageContent({ params }: CheckoutFinishPageProps) {
  return (
    <AuthGuard requireEmailVerified={false} preserveReturnUrl>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <CheckoutFinishPanel orderUuid={params.uuid} />
      </div>
    </AuthGuard>
  );
}

export default function CheckoutFinishPage(props: CheckoutFinishPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Memuat...
        </div>
      }
    >
      <CheckoutFinishPageContent {...props} />
    </Suspense>
  );
}
