import { ChevronDown, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-left transition-colors hover:border-brand-yellow-ink/50 hover:bg-background",
            className,
          )}
        >
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <span className="mt-0.5 block text-sm font-semibold">
              {value === null ? "Dowolnie" : `Od ${value} ${value === 1 ? "gwiazdki" : "gwiazdek"}`}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 max-w-[calc(100vw-2rem)] rounded-2xl border-border/70 p-3 shadow-pop"
      >
        <div className="text-sm font-semibold">Minimalna liczba gwiazdek</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Kliknij gwiazdkę, aby pokazać hotele o takim lub wyższym standardzie.
        </div>
        <div
          className="mt-3 flex items-center gap-1"
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
                  "flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground/35 transition-colors hover:bg-brand-yellow-soft hover:text-brand-yellow-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow-ink focus-visible:ring-offset-2",
                  isIncluded && "text-brand-yellow-ink",
                  isThreshold && "bg-brand-yellow-soft",
                )}
              >
                <Star className={cn("h-6 w-6", isIncluded && "fill-current")} />
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
          <span className="text-xs font-medium text-muted-foreground">
            {value === null ? "Brak minimum" : `${value} ${starNoun(value)} i więcej`}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-pressed={value === null}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted",
              value === null ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
          >
            Dowolnie
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
