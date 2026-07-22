import { RotateCcw } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { NullablePrice } from "@/lib/price-range";

const PRICE_MIN = 500;
const PRICE_MAX = 5_000;
const PRICE_STEP = 100;
const PRICE_HISTOGRAM = [5, 8, 11, 14, 17, 19, 18, 16, 17, 19, 18, 15, 13, 11, 8, 6];

const formatPrice = (price: number) => price.toLocaleString("pl-PL");

function getPriceSummary(minPrice: NullablePrice, maxPrice: NullablePrice) {
  if (minPrice === null && maxPrice === null) return "Dowolna";
  if (minPrice === null) return `Do ${formatPrice(maxPrice!)} zł`;
  if (maxPrice === null) return `Od ${formatPrice(minPrice)} zł`;
  return `${formatPrice(minPrice)}–${formatPrice(maxPrice)} zł`;
}

export function CompactPriceSlider({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  className,
}: {
  minPrice: NullablePrice;
  maxPrice: NullablePrice;
  onMinPriceChange: (value: NullablePrice) => void;
  onMaxPriceChange: (value: NullablePrice) => void;
  className?: string;
}) {
  const summaryId = useId();
  const resolvedMin = Math.min(PRICE_MAX, Math.max(PRICE_MIN, minPrice ?? PRICE_MIN));
  const resolvedMax = Math.max(resolvedMin, Math.min(PRICE_MAX, maxPrice ?? PRICE_MAX));
  const minPosition = ((resolvedMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPosition = ((resolvedMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const hasSelection = minPrice !== null || maxPrice !== null;

  const reset = () => {
    onMinPriceChange(null);
    onMaxPriceChange(null);
  };

  return (
    <div
      className={cn(
        "inline-grid w-[23.5rem] max-w-full grid-cols-[4.5rem_minmax(0,1fr)_2rem] items-center gap-2 rounded-lg border border-border bg-background/90 px-2.5 py-1.5",
        className,
      )}
    >
      <div className="min-w-0 leading-tight">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Cena
        </div>
        <div
          id={summaryId}
          aria-live="polite"
          className="truncate text-[11px] font-semibold text-foreground"
        >
          {getPriceSummary(minPrice, maxPrice)}
        </div>
      </div>

      <div className="min-w-0">
        <div className="relative h-6">
          <div className="absolute inset-x-1 bottom-1 flex h-5 items-end gap-px" aria-hidden="true">
            {PRICE_HISTOGRAM.map((height, index) => {
              const position = (index / (PRICE_HISTOGRAM.length - 1)) * 100;
              const selected = position >= minPosition && position <= maxPosition;
              return (
                <span
                  key={`${height}-${index}`}
                  className={cn(
                    "min-w-0 flex-1 rounded-[1px]",
                    selected ? "bg-brand-blue" : "bg-muted-foreground/20",
                  )}
                  style={{ height }}
                />
              );
            })}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 translate-y-1/2 rounded-full bg-muted" />
          <div
            className="absolute bottom-0 h-1 translate-y-1/2 rounded-full bg-brand-blue"
            style={{ left: `${minPosition}%`, width: `${maxPosition - minPosition}%` }}
          />
          <PriceThumb
            label="Cena minimalna"
            value={resolvedMin}
            valueText={minPrice === null ? "Bez dolnego limitu" : `${formatPrice(resolvedMin)} zł`}
            describedBy={summaryId}
            onChange={(value) => {
              const nextValue = Math.min(value, resolvedMax);
              onMinPriceChange(nextValue <= PRICE_MIN ? null : nextValue);
            }}
          />
          <PriceThumb
            label="Cena maksymalna"
            value={resolvedMax}
            valueText={maxPrice === null ? "Bez górnego limitu" : `${formatPrice(resolvedMax)} zł`}
            describedBy={summaryId}
            onChange={(value) => {
              const nextValue = Math.max(value, resolvedMin);
              onMaxPriceChange(nextValue >= PRICE_MAX ? null : nextValue);
            }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <PriceNumberField
            label="Min."
            value={resolvedMin}
            onChange={(value) => {
              const nextValue = Math.min(Math.max(value, PRICE_MIN), resolvedMax);
              onMinPriceChange(nextValue <= PRICE_MIN ? null : nextValue);
            }}
          />
          <PriceNumberField
            label="Maks."
            value={resolvedMax}
            onChange={(value) => {
              const nextValue = Math.max(Math.min(value, PRICE_MAX), resolvedMin);
              onMaxPriceChange(nextValue >= PRICE_MAX ? null : nextValue);
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={reset}
        disabled={!hasSelection}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-brand-blue-ink transition-colors hover:bg-brand-blue-soft disabled:cursor-default disabled:opacity-35"
        aria-label="Resetuj przedział cenowy"
        title="Resetuj przedział cenowy"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function PriceThumb({
  label,
  value,
  valueText,
  describedBy,
  onChange,
}: {
  label: string;
  value: number;
  valueText: string;
  describedBy: string;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="range"
      min={PRICE_MIN}
      max={PRICE_MAX}
      step={PRICE_STEP}
      value={value}
      onChange={(event) => onChange(Number(event.currentTarget.value))}
      aria-label={label}
      aria-valuetext={valueText}
      aria-describedby={describedBy}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-[-0.75rem] h-6 w-full appearance-none bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
        "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent",
        "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-blue [&::-webkit-slider-thumb]:shadow-soft",
        "[&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent",
        "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-blue [&::-moz-range-thumb]:shadow-soft",
      )}
    />
  );
}

function PriceNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const parsedValue = Number(draft);
    if (draft.trim() && Number.isFinite(parsedValue)) {
      onChange(parsedValue);
    } else {
      setDraft(String(value));
    }
  };

  return (
    <label className="flex h-6 min-w-0 flex-1 items-center gap-1 rounded-md border border-border bg-card px-1.5 text-[9px] text-muted-foreground focus-within:border-brand-blue">
      <span className="shrink-0">{label}</span>
      <input
        type="number"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="min-w-0 flex-1 appearance-none bg-transparent text-right text-[10px] font-semibold text-foreground outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="shrink-0">zł</span>
    </label>
  );
}
