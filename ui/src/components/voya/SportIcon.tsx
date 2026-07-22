import {
  Activity,
  Anchor,
  Bike,
  Footprints,
  MountainSnow,
  Sailboat,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

const SPORT_ICONS: Record<string, LucideIcon> = {
  kitesurfing: Wind,
  windsurfing: Sailboat,
  surfing: Waves,
  skiing: MountainSnow,
  diving: Anchor,
  trekking: Footprints,
  cycling: Bike,
};

export function SportIcon({ id, className = "h-4 w-4" }: { id: string; className?: string }) {
  const Icon = SPORT_ICONS[id] ?? Activity;
  return <Icon className={className} aria-hidden="true" />;
}
