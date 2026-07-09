"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import type { EventFaqItem, EventScheduleItem, EventSpeakerItem } from "@/lib/event-page-content";

interface EventMicrositeEditorProps {
  faq: EventFaqItem[];
  speakers: EventSpeakerItem[];
  schedule: EventScheduleItem[];
  onFaqChange: (items: EventFaqItem[]) => void;
  onSpeakersChange: (items: EventSpeakerItem[]) => void;
  onScheduleChange: (items: EventScheduleItem[]) => void;
}

export function EventMicrositeEditor({
  faq,
  speakers,
  schedule,
  onFaqChange,
  onSpeakersChange,
  onScheduleChange,
}: EventMicrositeEditorProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">FAQ</h3>
            <p className="text-sm text-muted-foreground">Pertanyaan yang sering diajukan peserta.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => onFaqChange([...faq, { question: "", answer: "" }])}>
            <Plus className="size-4" />
            Tambah FAQ
          </Button>
        </div>
        {faq.map((item, index) => (
          <div key={index} className="space-y-3 rounded-xl border p-4">
            <FormField id={`faq-q-${index}`} label="Pertanyaan">
              <Input
                value={item.question}
                onChange={(event) =>
                  onFaqChange(faq.map((row, rowIndex) => (rowIndex === index ? { ...row, question: event.target.value } : row)))
                }
              />
            </FormField>
            <FormField id={`faq-a-${index}`} label="Jawaban">
              <Textarea
                rows={3}
                value={item.answer}
                onChange={(event) =>
                  onFaqChange(faq.map((row, rowIndex) => (rowIndex === index ? { ...row, answer: event.target.value } : row)))
                }
              />
            </FormField>
            <Button type="button" variant="ghost" size="sm" onClick={() => onFaqChange(faq.filter((_, rowIndex) => rowIndex !== index))}>
              <Trash2 className="size-4" />
              Hapus
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Pembicara</h3>
            <p className="text-sm text-muted-foreground">Narasumber atau host acara.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSpeakersChange([...speakers, { name: "" }])}
          >
            <Plus className="size-4" />
            Tambah pembicara
          </Button>
        </div>
        {speakers.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
            <FormField id={`speaker-name-${index}`} label="Nama">
              <Input
                value={item.name}
                onChange={(event) =>
                  onSpeakersChange(
                    speakers.map((row, rowIndex) => (rowIndex === index ? { ...row, name: event.target.value } : row)),
                  )
                }
              />
            </FormField>
            <FormField id={`speaker-title-${index}`} label="Jabatan / peran">
              <Input
                value={item.title ?? ""}
                onChange={(event) =>
                  onSpeakersChange(
                    speakers.map((row, rowIndex) => (rowIndex === index ? { ...row, title: event.target.value } : row)),
                  )
                }
              />
            </FormField>
            <FormField id={`speaker-photo-${index}`} label="URL foto" className="sm:col-span-2">
              <Input
                value={item.photo_url ?? ""}
                onChange={(event) =>
                  onSpeakersChange(
                    speakers.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, photo_url: event.target.value } : row,
                    ),
                  )
                }
              />
            </FormField>
            <FormField id={`speaker-bio-${index}`} label="Bio" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={item.bio ?? ""}
                onChange={(event) =>
                  onSpeakersChange(
                    speakers.map((row, rowIndex) => (rowIndex === index ? { ...row, bio: event.target.value } : row)),
                  )
                }
              />
            </FormField>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="sm:col-span-2"
              onClick={() => onSpeakersChange(speakers.filter((_, rowIndex) => rowIndex !== index))}
            >
              <Trash2 className="size-4" />
              Hapus
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Rundown acara</h3>
            <p className="text-sm text-muted-foreground">Agenda detail di halaman publik (bukan jadwal mulai/selesai event).</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onScheduleChange([...schedule, { title: "" }])}
          >
            <Plus className="size-4" />
            Tambah sesi
          </Button>
        </div>
        {schedule.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
            <FormField id={`schedule-title-${index}`} label="Judul sesi" className="sm:col-span-2">
              <Input
                value={item.title}
                onChange={(event) =>
                  onScheduleChange(
                    schedule.map((row, rowIndex) => (rowIndex === index ? { ...row, title: event.target.value } : row)),
                  )
                }
              />
            </FormField>
            <FormField id={`schedule-start-${index}`} label="Waktu mulai">
              <Input
                value={item.start_at ?? ""}
                onChange={(event) =>
                  onScheduleChange(
                    schedule.map((row, rowIndex) => (rowIndex === index ? { ...row, start_at: event.target.value } : row)),
                  )
                }
                placeholder="09:00"
              />
            </FormField>
            <FormField id={`schedule-end-${index}`} label="Waktu selesai">
              <Input
                value={item.end_at ?? ""}
                onChange={(event) =>
                  onScheduleChange(
                    schedule.map((row, rowIndex) => (rowIndex === index ? { ...row, end_at: event.target.value } : row)),
                  )
                }
                placeholder="10:30"
              />
            </FormField>
            <FormField id={`schedule-desc-${index}`} label="Deskripsi" className="sm:col-span-2">
              <Textarea
                rows={2}
                value={item.description ?? ""}
                onChange={(event) =>
                  onScheduleChange(
                    schedule.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, description: event.target.value } : row,
                    ),
                  )
                }
              />
            </FormField>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="sm:col-span-2"
              onClick={() => onScheduleChange(schedule.filter((_, rowIndex) => rowIndex !== index))}
            >
              <Trash2 className="size-4" />
              Hapus
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
