import { Suspense } from "react";
import { ScannerPageContent } from "@/components/features/check-in/scanner-page-content";

export default function ScannerPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Memuat scanner...</p>}>
      <ScannerPageContent />
    </Suspense>
  );
}
