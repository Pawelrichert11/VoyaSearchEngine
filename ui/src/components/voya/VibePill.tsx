import { cn } from "@/lib/utils";
import { tonePillClasses } from "@/components/voya/style-system";

type Tone = "blue" | "green" | "yellow" | "pink" | "neutral";

export function VibePill({
  emoji,
  label,
  tone = "neutral",
  active = false,
  onClick,
  size = "md",
}: {
  emoji: string;
  label: string;
  tone?: Tone;
  active?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const t = tonePillClasses[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pill-vibe",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "lg" && "px-5 py-3 text-base",
        active ? t.active : t.idle,
      )}
      aria-pressed={active}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span>{label}</span>
      <span
        aria-hidden={!active}
        className={cn(
          "ml-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-opacity",
          active ? "bg-white/25 opacity-100" : "opacity-0",
        )}
      >
        ✓
      </span>
    </button>
  );
}
