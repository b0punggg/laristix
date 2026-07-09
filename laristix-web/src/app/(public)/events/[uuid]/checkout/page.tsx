import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { CheckoutPanel } from "@/components/features/checkout/checkout-panel";
import { CheckoutQueueGuard } from "@/components/features/checkout/checkout-queue-guard";

interface CheckoutPageProps {
  params: { uuid: string };
  searchParams: { ticket?: string; qty?: string };
}

function CheckoutPageContent({ params, searchParams }: CheckoutPageProps) {
  const ticketTypeId = Number(searchParams.ticket ?? 0);
  const initialQuantity = Math.max(1, Number(searchParams.qty ?? 1) || 1);

  return (
    <AuthGuard requireEmailVerified={false} preserveReturnUrl>
      <CheckoutQueueGuard
        eventUuid={params.uuid}
        ticketTypeId={ticketTypeId}
        quantity={initialQuantity}
      >
        <div className="mx-auto max-w-7xl px-4 py-8">
          <CheckoutPanel
            eventUuid={params.uuid}
            ticketTypeId={ticketTypeId}
            initialQuantity={initialQuantity}
          />
        </div>
      </CheckoutQueueGuard>
    </AuthGuard>
  );
}

export default function CheckoutPage(props: CheckoutPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Memuat checkout...
        </div>
      }
    >
      <CheckoutPageContent {...props} />
    </Suspense>
  );
}
