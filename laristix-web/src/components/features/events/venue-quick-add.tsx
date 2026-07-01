"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateVenueMutation } from "@/hooks/use-events";

interface VenueQuickAddProps {
  onCreated: (venueId: number) => void;
}

export function VenueQuickAdd({ onCreated }: VenueQuickAddProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const createMutation = useCreateVenueMutation();

  async function handleSave() {
    if (!name.trim() || createMutation.isPending) {
      return;
    }

    try {
      const venue = await createMutation.mutateAsync({
        name: name.trim(),
        city: city.trim() || undefined,
        address: address.trim() || undefined,
      });

      onCreated(venue.id);
      setName("");
      setCity("");
      setAddress("");
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
        <Label htmlFor="venue-name">Nama venue *</Label>
        <Input
          id="venue-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Gedung Serbaguna ABC"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSave();
            }
          }}
        />
      </div>
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
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => void handleSave()} disabled={createMutation.isPending || !name.trim()}>
          {createMutation.isPending ? "Menyimpan..." : "Simpan venue"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  );
}
