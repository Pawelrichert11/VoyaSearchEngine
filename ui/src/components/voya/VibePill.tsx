import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterIcon } from "@/components/voya/FilterIcon";
import { tonePillClasses } from "@/components/voya/style-system";

type Tone = keyof typeof tonePillClasses;

export function VibePill({
  id,
  label,
  tone = "neutral",
  active = false,
  onClick,
  size = "md",
}: {
  id: string;
  label: string;
  tone?: Tone;
  active?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const toneClasses = tonePillClasses[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pill-vibe",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "lg" && "px-5 py-3 text-base",
        active ? toneClasses.active : toneClasses.idle,
      )}
      aria-pressed={active}
    >
      <FilterIcon id={id} />
      <span>{label}</span>
      <Check
        aria-hidden={!active}
        className={cn(
          "ml-0.5 h-3.5 w-3.5 shrink-0 transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}
