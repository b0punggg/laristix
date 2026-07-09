import { EventCheckoutSettingsPanel } from "@/components/features/events/event-checkout-settings-panel";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function EventCheckoutSettingsPage({ params }: PageProps) {
  const { uuid } = await params;

  return <EventCheckoutSettingsPanel eventUuid={uuid} />;
}
