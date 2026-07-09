"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSectionCard } from "@/components/features/events/event-management-ui";
import { EventGalleryEditor } from "@/components/features/events/event-gallery-editor";
import { EventMicrositeEditor } from "@/components/features/events/event-microsite-editor";
import { EventSubNav } from "@/components/features/events/event-sub-nav";
import { routes } from "@/config/env";
import { useEventQuery, useUpdateEventMutation } from "@/hooks/use-events";
import { buildEventSettings } from "@/lib/event-settings";
import { parseEventMicrositeSettings, type EventMicrositeSettings } from "@/lib/event-microsite";
import type { EventFaqItem, EventGalleryItem, EventScheduleItem, EventSpeakerItem } from "@/lib/event-page-content";

interface EventMicrositePanelProps {
  eventUuid: string;
}

export function EventMicrositePanel({ eventUuid }: EventMicrositePanelProps) {
  const eventQuery = useEventQuery(eventUuid);
  const updateMutation = useUpdateEventMutation(eventUuid);
  const [gallery, setGallery] = useState<EventGalleryItem[]>([]);
  const [faq, setFaq] = useState<EventFaqItem[]>([]);
  const [speakers, setSpeakers] = useState<EventSpeakerItem[]>([]);
  const [schedule, setSchedule] = useState<EventScheduleItem[]>([]);

  useEffect(() => {
    if (!eventQuery.data) {
      return;
    }

    const microsite = parseEventMicrositeSettings(eventQuery.data.settings);
    setGallery(microsite.gallery);
    setFaq(microsite.faq);
    setSpeakers(microsite.speakers);
    setSchedule(microsite.schedule);
  }, [eventQuery.data]);

  async function handleSave() {
    if (!eventQuery.data) {
      return;
    }

    const microsite: EventMicrositeSettings = { gallery, faq, speakers, schedule };

    await updateMutation.mutateAsync({
      settings: buildEventSettings(eventQuery.data.settings, { microsite }),
    });
  }

  const publicUrl = routes.publicEvent(eventUuid);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={routes.organizerEvents}>
          <ArrowLeft className="size-4" />
          Kembali ke event
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Halaman event</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Atur galeri, FAQ, pembicara, dan rundown untuk halaman publik event {eventQuery.data?.title ?? ""}.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            Lihat halaman publik
          </Link>
        </Button>
      </div>

      <EventSubNav eventUuid={eventUuid} eventStatus={eventQuery.data?.status} />

      <FormSectionCard title="Galeri foto" description="Foto tambahan selain banner utama.">
        <EventGalleryEditor items={gallery} onChange={setGallery} />
      </FormSectionCard>

      <FormSectionCard title="Konten microsite" description="Bagian tambahan di tab Deskripsi halaman publik.">
        <EventMicrositeEditor
          faq={faq}
          speakers={speakers}
          schedule={schedule}
          onFaqChange={setFaq}
          onSpeakersChange={setSpeakers}
          onScheduleChange={setSchedule}
        />
      </FormSectionCard>

      <div className="flex justify-end">
        <Button className="bg-brand hover:bg-brand-hover" disabled={updateMutation.isPending} onClick={() => void handleSave()}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan halaman event"
          )}
        </Button>
      </div>
    </div>
  );
}
