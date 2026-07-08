"use client";

import { Facebook, Link2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PublicEventDetailShareProps {
  title: string;
  className?: string;
}

export function PublicEventDetailShare({ title, className }: PublicEventDetailShareProps) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link disalin");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className={className}>
      <p className="mb-3 text-sm font-semibold text-foreground">Bagikan Event</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={copyLink} aria-label="Salin link">
          <Link2 className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="rounded-full" asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Bagikan ke WhatsApp">
            <MessageCircle className="size-4" />
          </a>
        </Button>
        <Button type="button" variant="outline" size="icon" className="rounded-full" asChild>
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Bagikan ke Facebook">
            <Facebook className="size-4" />
          </a>
        </Button>
        <Button type="button" variant="outline" size="icon" className="rounded-full" asChild>
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Bagikan ke X">
            <span className="text-sm font-bold">X</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
