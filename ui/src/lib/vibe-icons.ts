import {
  Building2,
  Camera,
  Coffee,
  Flower2,
  Landmark,
  Mountain,
  PartyPopper,
  Snowflake,
  Sun,
  Tag,
  Trees,
  Umbrella,
  Users,
  Utensils,
  Waves,
  Wine,
  type LucideIcon,
} from "lucide-react";

export const VIBE_ICONS: Record<string, LucideIcon> = {
  Plaża: Umbrella,
  Impreza: PartyPopper,
  Słońce: Sun,
  "All-inclusive": Utensils,
  Nurkowanie: Waves,
  Wulkany: Mountain,
  Dżungla: Trees,
  Rodzinne: Users,
  Snorkeling: Waves,
  Basen: Waves,
  Kawiarnie: Coffee,
  Muzea: Landmark,
  Zabytki: Landmark,
  Narty: Snowflake,
  Góry: Mountain,
  "Après-ski": Wine,
  Kuchnia: Utensils,
  Miasto: Building2,
  Joga: Flower2,
  Śnieg: Snowflake,
  Zdjęcia: Camera,
};

export function vibeIcon(label: string): LucideIcon {
  return VIBE_ICONS[label] ?? Tag;
}
