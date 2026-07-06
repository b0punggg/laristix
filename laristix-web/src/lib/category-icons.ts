import type { LucideIcon } from "lucide-react";
import {
  Heart,
  Monitor,
  Music,
  Presentation,
  Sparkles,
  Tag,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";

const categoryIconMap: Record<string, LucideIcon> = {
  presentation: Presentation,
  wrench: Wrench,
  users: Users,
  music: Music,
  sparkles: Sparkles,
  trophy: Trophy,
  heart: Heart,
  monitor: Monitor,
};

export function getCategoryIcon(icon: string | null | undefined): LucideIcon {
  if (!icon) {
    return Tag;
  }

  return categoryIconMap[icon] ?? Tag;
}
