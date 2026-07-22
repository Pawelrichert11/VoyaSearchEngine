import { Link } from "@tanstack/react-router";
import { Building2, ChevronDown, ChevronUp, Compass, Lock, Plane } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Vibe } from "@/lib/voya-data";
import { CompactPriceSlider } from "@/components/voya/CompactPriceSlider";
import { SportIcon } from "@/components/voya/SportIcon";
import { StarThresholdPicker } from "@/components/voya/StarThresholdPicker";
import { VibePill } from "@/components/voya/VibePill";
import { voya, voyaButtonVariants, voyaSegmentVariants } from "@/components/voya/style-system";

export type SearchFilterTab = "destination" | "hotel" | "flight";

type DestinationMode = "vibe" | "specific";
type SportOption = { id: string; label: string };

export function SearchFilterPanel({
  activeTab,
  onTabClick,
  grouped,
  hotelMaxPrice,
  hotelMinPrice,
  hotelStars,
  lodgingTypeIds,
  selected,
  selectedSports,
  setHotelMaxPrice,
  setHotelMinPrice,
  setHotelStars,
  sportOptions,
  toMode,
  toggle,
  toggleSport,
}: {
  activeTab: SearchFilterTab | null;
  onTabClick: (tab: SearchFilterTab) => void;
  grouped: Record<string, Vibe[]>;
  hotelMaxPrice: number | null;
  hotelMinPrice: number | null;
  hotelStars: number | null;
  lodgingTypeIds: string[];
  selected: string[];
  selectedSports: string[];
  setHotelMaxPrice: (value: number | null) => void;
  setHotelMinPrice: (value: number | null) => void;
  setHotelStars: (value: number | null) => void;
  sportOptions: SportOption[];
  toMode: DestinationMode;
  toggle: (id: string) => void;
  toggleSport: (id: string) => void;
}) {
  const destinationPills = [...grouped.destination, ...grouped.mood].filter(
    (pill) => pill.id !== "active",
  );
  const weatherPills = grouped.climate;
  const lodgingPills = grouped.stay.filter((pill) => lodgingTypeIds.includes(pill.id));
  const standardPills = grouped.stay.filter((pill) => !lodgingTypeIds.includes(pill.id));
  const flightPills = grouped.flight;
  const showDestinationTab = toMode === "vibe";
  const openTab = showDestinationTab || activeTab !== "destination" ? activeTab : null;
  const activeLabel =
    openTab === "destination" ? "Destynacja" : openTab === "hotel" ? "Hotel" : "Lot";
  return (
    <div className="relative z-[70]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
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
          <CompactPriceSlider
            minPrice={hotelMinPrice}
            maxPrice={hotelMaxPrice}
            onMinPriceChange={setHotelMinPrice}
            onMaxPriceChange={setHotelMaxPrice}
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
        <div className={cn(voya.dropdown, "z-[80]")}>
          <div className={cn(voya.eyebrow, "mb-2.5")}>{activeLabel}</div>
          <div>
            {openTab === "destination" && (
              <div className="space-y-3">
                {toMode === "vibe" ? (
                  <>
                    <LabeledFilterChipCloud
                      label="Charakter miejsca"
                      pills={destinationPills}
                      selected={selected}
                      toggle={toggle}
                    />
                    <LabeledFilterChipCloud
                      label="Pogoda"
                      pills={weatherPills}
                      selected={selected}
                      toggle={toggle}
                    />
                    <div className="space-y-1.5">
                      <div className={voya.chipLabel}>Aktywnie</div>
                      <div className="flex flex-wrap gap-1.5">
                        {sportOptions.map((sport) => {
                          const active = selectedSports.includes(sport.id);
                          return (
                            <button
                              key={sport.id}
                              type="button"
                              onClick={() => toggleSport(sport.id)}
                              aria-pressed={active}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                                active
                                  ? "border-brand-green/40 bg-brand-green-soft text-brand-green-ink shadow-soft"
                                  : "border-border bg-background text-foreground hover:bg-muted",
                              )}
                            >
                              <SportIcon id={sport.id} className="h-4 w-4 shrink-0" />
                              {sport.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
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
                <StarThresholdPicker
                  value={hotelStars}
                  onChange={setHotelStars}
                  className="md:max-w-sm"
                />
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
          id={vibe.id}
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
