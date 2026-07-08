import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "yellow" | "pink" | "neutral";

const toneMap: Record<Tone, { active: string; idle: string }> = {
  blue: {
    active:
      "bg-brand-blue text-white border-brand-blue-ink ring-2 ring-brand-blue/40 ring-offset-2 ring-offset-background shadow-pop",
    idle: "bg-brand-blue-soft text-brand-blue-ink border-brand-blue-soft hover:bg-brand-blue-soft/70",
  },
  green: {
    active:
      "bg-brand-green text-white border-brand-green-ink ring-2 ring-brand-green/40 ring-offset-2 ring-offset-background shadow-pop",
    idle: "bg-brand-green-soft text-brand-green-ink border-brand-green-soft hover:brightness-105",
  },
  yellow: {
    active:
      "bg-brand-yellow text-brand-yellow-ink border-brand-yellow-ink ring-2 ring-brand-yellow/60 ring-offset-2 ring-offset-background shadow-pop",
    idle: "bg-brand-yellow-soft text-brand-yellow-ink border-brand-yellow-soft hover:brightness-105",
  },
  pink: {
    active:
      "bg-brand-pink text-white border-brand-pink ring-2 ring-brand-pink/40 ring-offset-2 ring-offset-background shadow-pop",
    idle: "bg-brand-pink-soft text-foreground border-brand-pink-soft",
  },
  neutral: {
    active:
      "bg-foreground text-background border-foreground ring-2 ring-foreground/30 ring-offset-2 ring-offset-background shadow-pop",
    idle: "bg-background text-foreground border-border hover:bg-muted",
  },
};

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
  const t = toneMap[tone];
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
