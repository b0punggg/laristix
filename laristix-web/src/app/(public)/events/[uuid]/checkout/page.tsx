import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { CheckoutPanel } from "@/components/features/checkout/checkout-panel";

interface CheckoutPageProps {
  params: { uuid: string };
  searchParams: { ticket?: string };
}

function CheckoutPageContent({ params, searchParams }: CheckoutPageProps) {
  const ticketTypeId = Number(searchParams.ticket ?? 0);

  return (
    <AuthGuard requireEmailVerified={false} preserveReturnUrl>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <CheckoutPanel eventUuid={params.uuid} ticketTypeId={ticketTypeId} />
      </div>
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
