import { Link } from "@tanstack/react-router";
import { Building2, ChevronDown, ChevronUp, Compass, Lock, Minus, Plane, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Vibe } from "@/lib/voya-data";
import { VibePill } from "@/components/voya/VibePill";
import { voya, voyaButtonVariants, voyaSegmentVariants } from "@/components/voya/style-system";

export type SearchFilterTab = "destination" | "hotel" | "flight";

type DestinationMode = "vibe" | "specific";
type SportOption = { id: string; label: string; places: string[] };

export function SearchFilterPanel({
  activeTab,
  onTabClick,
  grouped,
  hotelStars,
  lodgingTypeIds,
  reviewScore,
  selected,
  selectedSports,
  setHotelStars,
  setReviewScore,
  setSportsOpen,
  sportOptions,
  toMode,
  toggle,
}: {
  activeTab: SearchFilterTab | null;
  onTabClick: (tab: SearchFilterTab) => void;
  grouped: Record<string, Vibe[]>;
  hotelStars: number | null;
  lodgingTypeIds: string[];
  reviewScore: number | null;
  selected: string[];
  selectedSports: string[];
  setHotelStars: (value: number | null) => void;
  setReviewScore: (value: number | null) => void;
  setSportsOpen: (value: boolean) => void;
  sportOptions: SportOption[];
  toMode: DestinationMode;
  toggle: (id: string) => void;
}) {
  const destinationPills = [...grouped.destination, ...grouped.mood, ...grouped.climate];
  const lodgingPills = grouped.stay.filter((pill) => lodgingTypeIds.includes(pill.id));
  const standardPills = grouped.stay.filter((pill) => !lodgingTypeIds.includes(pill.id));
  const flightPills = grouped.flight;
  const showDestinationTab = toMode === "vibe";
  const openTab = showDestinationTab || activeTab !== "destination" ? activeTab : null;
  const activeLabel =
    openTab === "destination" ? "Destynacja" : openTab === "hotel" ? "Hotel" : "Lot";

  return (
    <div className="relative z-30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {showDestinationTab && (
            <FilterSegmentButton
              active={activeTab === "destination"}
              icon={<Compass className="h-3.5 w-3.5" />}
              label="Destynacja"
              onClick={() => onTabClick("destination")}
            />
          )}
          <FilterSegmentButton
            active={activeTab === "hotel"}
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="Hotel"
            onClick={() => onTabClick("hotel")}
          />
          <FilterSegmentButton
            active={activeTab === "flight"}
            icon={<Plane className="h-3.5 w-3.5" />}
            label="Lot"
            onClick={() => onTabClick("flight")}
          />
          <FilterSegmentButton
            disabled
            icon={<Lock className="h-3.5 w-3.5" />}
            label="Własny filtr AI"
          />
        </div>
        <Link
          to="/results/$id"
          params={{ id: "demo" }}
          className={cn(
            voyaButtonVariants({ variant: "primary", size: "sm" }),
            "px-5 shadow-pop transition-transform hover:-translate-y-0.5",
          )}
        >
          Wyszukaj
        </Link>
      </div>

      {openTab && (
        <div className={voya.dropdown}>
          <div className={cn(voya.eyebrow, "mb-2.5")}>{activeLabel}</div>
          <div>
            {openTab === "destination" && (
              <div className="space-y-3">
                {toMode === "vibe" ? (
                  <>
                    <FilterChipCloud pills={destinationPills} selected={selected} toggle={toggle} />
                    {selectedSports.length > 0 && (
                      <div className="grid gap-1.5 md:grid-cols-[130px_1fr] md:items-center">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Sporty
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSports.map((sportId) => {
                            const sport = sportOptions.find((option) => option.id === sportId);
                            if (!sport) return null;
                            return (
                              <button
                                key={sport.id}
                                type="button"
                                onClick={() => setSportsOpen(true)}
                                className="rounded-full bg-brand-green-soft px-3 py-1 font-medium text-brand-green-ink"
                              >
                                {sport.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-1 py-2 text-xs text-muted-foreground">
                    Masz wybrane konkretne miejsce. Zmień je w polu "Dokąd" w górnym formularzu.
                  </div>
                )}
              </div>
            )}

            {openTab === "hotel" && (
              <div className="space-y-2">
                <LabeledFilterChipCloud
                  label="Zakwaterowanie"
                  pills={lodgingPills}
                  selected={selected}
                  toggle={toggle}
                />
                <LabeledFilterChipCloud
                  label="Udogodnienia"
                  pills={standardPills}
                  selected={selected}
                  toggle={toggle}
                />
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <NumberThresholdPicker
                    title="Liczba gwiazdek"
                    value={hotelStars}
                    suffix="gwiazdek+"
                    min={1}
                    max={5}
                    onChange={setHotelStars}
                  />
                  <NumberThresholdPicker
                    title="Opinie"
                    value={reviewScore}
                    suffix="/10+"
                    min={1}
                    max={10}
                    onChange={setReviewScore}
                  />
                </div>
              </div>
            )}

            {openTab === "flight" && (
              <FilterChipCloud pills={flightPills} selected={selected} toggle={toggle} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSegmentButton({
  active,
  disabled,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-expanded={active}
      className={voyaSegmentVariants({ active })}
    >
      {icon}
      <span>{label}</span>
      {!disabled &&
        (active ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
    </button>
  );
}

function FilterChipCloud({
  pills,
  selected,
  toggle,
}: {
  pills: Vibe[];
  selected: string[];
  toggle: (id: string) => void;
}) {
  if (pills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((vibe) => (
        <VibePill
          key={vibe.id}
          emoji={vibe.emoji}
          label={vibe.label}
          tone={vibe.tone}
          active={selected.includes(vibe.id)}
          onClick={() => toggle(vibe.id)}
          size="sm"
        />
      ))}
    </div>
  );
}

function LabeledFilterChipCloud({
  label,
  pills,
  selected,
  toggle,
}: {
  label: string;
  pills: Vibe[];
  selected: string[];
  toggle: (id: string) => void;
}) {
  if (pills.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className={voya.chipLabel}>{label}</div>
      <FilterChipCloud pills={pills} selected={selected} toggle={toggle} />
    </div>
  );
}

function NumberThresholdPicker({
  title,
  value,
  suffix,
  min,
  max,
  onChange,
}: {
  title: string;
  value: number | null;
  suffix: string;
  min: number;
  max: number;
  onChange: (value: number | null) => void;
}) {
  const current = value ?? min;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-2">
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        <div className="mt-0.5 text-sm font-semibold">
          {value === null ? "Dowolnie" : `${value}${suffix}`}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() =>
            onChange(value === null || value <= min ? null : Math.max(min, current - 1))
          }
          disabled={value === null}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Zmniejsz: ${title}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-9 text-center text-sm font-semibold">{value ?? "-"}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value === null ? min : current + 1))}
          disabled={value !== null && value >= max}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Zwiększ: ${title}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
