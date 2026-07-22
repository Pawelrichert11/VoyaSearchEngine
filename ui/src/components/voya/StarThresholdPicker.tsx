import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STAR_OPTIONS = [1, 2, 3, 4, 5] as const;

function starNoun(value: number) {
  if (value === 1) return "gwiazdka";
  if (value < 5) return "gwiazdki";
  return "gwiazdek";
}

export function StarThresholdPicker({
  value,
  onChange,
  label = "Liczba gwiazdek",
  className,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-xs font-medium text-foreground">
          {value === null ? "Dowolnie" : `Od ${value} ${value === 1 ? "gwiazdki" : "gwiazdek"}`}
        </div>
      </div>
      <div
        className="flex items-center gap-0.5"
        role="group"
        aria-label="Minimalna liczba gwiazdek"
      >
        {STAR_OPTIONS.map((star) => {
          const isThreshold = value === star;
          const isIncluded = value !== null && star >= value;

          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(isThreshold ? null : star)}
              aria-label={`Co najmniej ${star} ${starNoun(star)}`}
              aria-pressed={isThreshold}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/35 transition-colors hover:bg-brand-yellow-soft hover:text-brand-yellow-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow-ink focus-visible:ring-offset-2",
                isIncluded && "text-brand-yellow-ink",
                isThreshold && "bg-brand-yellow-soft",
              )}
            >
              <Star className={cn("h-5 w-5", isIncluded && "fill-current")} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
