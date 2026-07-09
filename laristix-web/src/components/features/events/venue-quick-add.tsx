"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useCreateVenueMutation } from "@/hooks/use-events";
import type { CreateVenuePayload } from "@/types/event";

interface VenueQuickAddProps {
  onCreated: (venueId: number) => void;
  defaultType?: CreateVenuePayload["type"];
}

export function VenueQuickAdd({ onCreated, defaultType = "physical" }: VenueQuickAddProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CreateVenuePayload["type"]>(defaultType);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [onlineUrl, setOnlineUrl] = useState("");
  const createMutation = useCreateVenueMutation();

  async function handleSave() {
    if (!name.trim() || createMutation.isPending) {
      return;
    }

    if (type === "online" && !onlineUrl.trim()) {
      return;
    }

    try {
      const venue = await createMutation.mutateAsync({
        name: name.trim(),
        type,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        online_url: type === "online" || type === "hybrid" ? onlineUrl.trim() || undefined : undefined,
      });

      onCreated(venue.id);
      setName("");
      setCity("");
      setAddress("");
      setOnlineUrl("");
      setType(defaultType);
      setOpen(false);
    } catch {
      // Error toast handled by mutation onError.
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Tambah venue baru
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <p className="text-sm font-medium">Venue baru</p>
      <div className="space-y-2">
        <Label htmlFor="venue-type">Tipe venue</Label>
        <Select
          id="venue-type"
          value={type}
          onChange={(event) => setType(event.target.value as CreateVenuePayload["type"])}
        >
          <option value="physical">Offline (fisik)</option>
          <option value="online">Online</option>
          <option value="hybrid">Hybrid</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="venue-name">Nama venue *</Label>
        <Input
          id="venue-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === "online" ? "Zoom / YouTube Live" : "Gedung Serbaguna ABC"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSave();
            }
          }}
        />
      </div>
      {type === "online" || type === "hybrid" ? (
        <div className="space-y-2">
          <Label htmlFor="venue-online-url">Link streaming / meeting *</Label>
          <Input
            id="venue-online-url"
            type="url"
            value={onlineUrl}
            onChange={(e) => setOnlineUrl(e.target.value)}
            placeholder="https://zoom.us/j/..."
          />
        </div>
      ) : null}
      {type === "physical" || type === "hybrid" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="venue-city">Kota</Label>
            <Input
              id="venue-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Jakarta"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="venue-address">Alamat</Label>
            <Input
              id="venue-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Contoh No. 1"
            />
          </div>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void handleSave()}
          disabled={
            createMutation.isPending ||
            !name.trim() ||
            ((type === "online" || type === "hybrid") && !onlineUrl.trim())
          }
        >
          {createMutation.isPending ? "Menyimpan..." : "Simpan venue"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  );
}
