import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Lock,
  MapPin,
  MessageCircle,
  Minus,
  Plane,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { TopBar } from "@/components/voya/TopBar";
import { CountryFlag } from "@/components/voya/CountryFlag";
import { VibePill } from "@/components/voya/VibePill";
import { RotatingHero } from "@/components/voya/RotatingHero";
import { VIBES, DEPARTURE_COUNTRIES, DEMO_RESULTS, type Vibe, type Country } from "@/lib/voya-data";

export const Route = createFileRoute("/")({
  component: SearchHome,
});

const LODGING_TYPES = ["hotel", "apartment", "resort", "hostel", "glamping", "bnb", "boutique"];

const FLEX_MONTHS = [
  { label: "Marzec 2026", value: "2026-03" },
  { label: "Kwiecień 2026", value: "2026-04" },
  { label: "Maj 2026", value: "2026-05" },
  { label: "Czerwiec 2026", value: "2026-06" },
  { label: "Lipiec 2026", value: "2026-07" },
  { label: "Sierpień 2026", value: "2026-08" },
  { label: "Wrzesień 2026", value: "2026-09" },
];

type SearchMode = "chat" | "filters";
type FilterTab = "destination" | "hotel" | "flight";
type DestinationMode = "vibe" | "specific";
type DestinationCountry = { code: string; flag: string; name: string; cities: string[] };
type DestinationSelection = {
  id: string;
  type: "country" | "city";
  countryCode: string;
  country: string;
  flag: string;
  name: string;
};
type GuestCounts = { adults: number; children: number; rooms: number };
type SportOption = { id: string; label: string; places: string[] };

const DESTINATION_COUNTRIES: DestinationCountry[] = [
  { code: "PT", flag: "🇵🇹", name: "Portugalia", cities: ["Lizbona", "Porto", "Madera", "Algarve"] },
  {
    code: "ES",
    flag: "🇪🇸",
    name: "Hiszpania",
    cities: ["Barcelona", "Madryt", "Walencja", "Palma de Mallorca", "Teneryfa"],
  },
  {
    code: "IT",
    flag: "🇮🇹",
    name: "Włochy",
    cities: ["Rzym", "Mediolan", "Neapol", "Sycylia", "Sardynia"],
  },
  {
    code: "GR",
    flag: "🇬🇷",
    name: "Grecja",
    cities: ["Ateny", "Kreta", "Rodos", "Santorini", "Korfu"],
  },
  { code: "HR", flag: "🇭🇷", name: "Chorwacja", cities: ["Split", "Dubrownik", "Zadar", "Istria"] },
  { code: "TR", flag: "🇹🇷", name: "Turcja", cities: ["Antalya", "Stambuł", "Bodrum", "Dalaman"] },
  { code: "ID", flag: "🇮🇩", name: "Indonezja", cities: ["Bali", "Lombok", "Dżakarta"] },
  { code: "JP", flag: "🇯🇵", name: "Japonia", cities: ["Tokio", "Osaka", "Kioto"] },
  {
    code: "US",
    flag: "🇺🇸",
    name: "Stany Zjednoczone",
    cities: ["Nowy Jork", "Miami", "Los Angeles", "San Francisco"],
  },
  { code: "MA", flag: "🇲🇦", name: "Maroko", cities: ["Marrakesz", "Agadir", "Casablanca"] },
];

const SPORT_OPTIONS: SportOption[] = [
  { id: "kitesurfing", label: "Kitesurfing", places: ["Tarifa", "Fuerteventura", "Rodos"] },
  { id: "windsurfing", label: "Windsurfing", places: ["Vasiliki", "Teneryfa", "Sotavento"] },
  { id: "surfing", label: "Surfing", places: ["Ericeira", "Bali", "San Sebastián"] },
  { id: "skiing", label: "Narty", places: ["Alpy", "Dolomity", "Zakopane"] },
  { id: "diving", label: "Nurkowanie", places: ["Malta", "Kreta", "Bali"] },
  { id: "trekking", label: "Trekking", places: ["Madera", "Teneryfa", "Sycylia"] },
  { id: "cycling", label: "Rower", places: ["Majorka", "Algarve", "Istria"] },
];

const MONTH_NAMES = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];
const FLEX_YEARS = [2026, 2027];

const getDestinationItem = (country: DestinationCountry, city?: string): DestinationSelection => ({
  id: city ? `city:${country.code}:${city}` : `country:${country.code}`,
  type: city ? "city" : "country",
  countryCode: country.code,
  country: country.name,
  flag: country.flag,
  name: city ?? country.name,
});

const summarizeList = (items: string[], visibleCount = 2) => {
  if (items.length <= visibleCount) return items.join(", ");
  return `${items.slice(0, visibleCount).join(", ")} +${items.length - visibleCount}`;
};

const unique = (items: string[]) => Array.from(new Set(items));

const getDestinationLabel = (mode: DestinationMode, destinations: DestinationSelection[]) => {
  if (mode === "vibe") return "Wszędzie · dopasuj do vibe";
  if (destinations.length === 0) return "Wybierz kraje lub miasta";

  const countries = unique(destinations.map((item) => item.country));
  const cities = destinations.filter((item) => item.type === "city").map((item) => item.name);
  const countryPart = summarizeList(countries, 2);
  const cityPart = cities.length > 0 ? ` · ${summarizeList(cities, 2)}` : "";

  return `${countryPart}${cityPart}`;
};

const formatGuests = ({ adults, children, rooms }: GuestCounts) => {
  const adultsLabel = adults === 1 ? "1 dorosły" : `${adults} dorosłych`;
  const childrenLabel = children === 1 ? "1 dziecko" : `${children} dzieci`;
  const roomsLabel = rooms === 1 ? "1 pokój" : rooms < 5 ? `${rooms} pokoje` : `${rooms} pokoi`;
  return [adultsLabel, children > 0 ? childrenLabel : null, roomsLabel].filter(Boolean).join(" · ");
};

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatShortDate = (value: string) => {
  if (!value) return "";
  const date = parseLocalDate(value);
  return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" });
};

const monthLabel = (year: number, monthIndex: number) => `${MONTH_NAMES[monthIndex]} ${year}`;

function SearchHome() {
  const [searchMode, setSearchMode] = useState<SearchMode>("chat");
  const [filterTab, setFilterTab] = useState<FilterTab | null>("destination");
  const [tripPrompt, setTripPrompt] = useState("");
  const [selected, setSelected] = useState<string[]>(["pool", "party", "sun", "direct"]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [customVibes, setCustomVibes] = useState<Vibe[]>([]);

  // Skąd
  const [fromOpen, setFromOpen] = useState(false);
  const [fromAirport, setFromAirport] = useState<{ country: string; code: string; name: string }>({
    country: "Polska",
    code: "WAW",
    name: "Warszawa Chopin",
  });

  // Dokąd
  const [toOpen, setToOpen] = useState(false);
  const [toMode, setToMode] = useState<DestinationMode>("vibe");
  const [toDestinations, setToDestinations] = useState<DestinationSelection[]>([]);

  // Kiedy
  const [whenOpen, setWhenOpen] = useState(false);
  const [dateMode, setDateMode] = useState<"exact" | "flex">("flex");
  const [dateStart, setDateStart] = useState("2026-06-12");
  const [dateEnd, setDateEnd] = useState("2026-06-19");
  const [flexRange, setFlexRange] = useState(3);
  const [flexMonths, setFlexMonths] = useState<string[]>(["Czerwiec 2026"]);
  const [flexNights, setFlexNights] = useState(7);

  // Kto
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 2, children: 0, rooms: 1 });

  // Hotel
  const [hotelStars, setHotelStars] = useState<number | null>(null);
  const [reviewScore, setReviewScore] = useState<number | null>(null);

  // Aktywnie
  const [sportsOpen, setSportsOpen] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const allVibes = useMemo(() => [...VIBES, ...customVibes], [customVibes]);
  const grouped = useMemo(() => {
    const g: Record<string, Vibe[]> = {
      mood: [],
      climate: [],
      budget: [],
      stay: [],
      ai: [],
      destination: [],
      flight: [],
    };
    for (const v of allVibes) g[v.category].push(v);
    return g;
  }, [allVibes]);

  const toggle = (id: string) => {
    if (id === "active") {
      setSportsOpen(true);
      return;
    }
    const exclusiveGroup = ["direct", "onestop"].includes(id) ? ["direct", "onestop"] : null;
    setSelected((s) => {
      if (exclusiveGroup) {
        return s.includes(id)
          ? s.filter((x) => x !== id)
          : [...s.filter((x) => !exclusiveGroup.includes(x)), id];
      }
      return s.includes(id) ? s.filter((x) => x !== id) : [...s, id];
    });
  };

  const addCustom = () => {
    if (!aiPrompt.trim()) return;
    const id = `ai-${Date.now()}`;
    const emoji = "✨";
    const label = aiPrompt.length > 24 ? aiPrompt.slice(0, 22) + "…" : aiPrompt;
    setCustomVibes((c) => [...c, { id, emoji, label, tone: "pink", category: "ai" }]);
    setSelected((s) => [...s, id]);
    setAiPrompt("");
    setAiOpen(false);
  };

  const whenLabel =
    dateMode === "exact"
      ? `${dateStart} → ${dateEnd}`
      : `${summarizeList(flexMonths, 2) || "Wybierz miesiące"} · ${flexNights} nocy · ±${flexRange} dni`;
  const toLabel = getDestinationLabel(toMode, toDestinations);
  const guestsLabel = formatGuests(guests);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Hero */}
      <section className="relative overflow-visible">
        <RotatingHero />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-blue" />
              AI dopasuje trip z opisu albo filtrów
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-6xl">
              Opisz trip,
              <br />a Voya znajdzie lot + nocleg
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Startuj od promptu jak w builderze AI albo klasycznie klikaj filtry. Potem dostajesz
              arkusz z ofertami, komentarzami i mapą lotów do wspólnego wyboru.
            </p>
          </div>

          {/* Search card */}
          <div className="mx-auto mt-10 max-w-5xl">
            <div className="rounded-[2rem] border border-border bg-card/95 p-3 shadow-pop backdrop-blur sm:p-4">
              <div className="mb-3 flex rounded-full bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setSearchMode("chat")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    searchMode === "chat"
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat AI
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("filters")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    searchMode === "filters"
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Search className="h-4 w-4" />
                  Filtry
                </button>
              </div>
              <div className="min-h-[108px]">
                {searchMode === "chat" ? (
                  <TripChatBox prompt={tripPrompt} setPrompt={setTripPrompt} />
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                      <Field
                        icon={<MapPin className="h-4 w-4 text-brand-blue" />}
                        label="Skąd"
                        value={`${fromAirport.name} (${fromAirport.code})`}
                        col="sm:col-span-3"
                        onClick={() => setFromOpen(true)}
                      />
                      <Field
                        icon={<ArrowRight className="h-4 w-4 text-brand-green" />}
                        label="Dokąd"
                        value={toLabel}
                        col="sm:col-span-4"
                        onClick={() => setToOpen(true)}
                      />
                      <Field
                        icon={<CalendarDays className="h-4 w-4 text-brand-yellow-ink" />}
                        label="Kiedy"
                        value={whenLabel}
                        col="sm:col-span-3"
                        onClick={() => setWhenOpen(true)}
                      />
                      <Field
                        icon={<Users className="h-4 w-4 text-brand-pink" />}
                        label="Kto"
                        value={guestsLabel}
                        col="sm:col-span-2"
                        onClick={() => setGuestsOpen(true)}
                      />
                    </div>
                    <FilterTabsPanel
                      activeTab={filterTab}
                      onTabClick={(tab) =>
                        setFilterTab((current) => (current === tab ? null : tab))
                      }
                      grouped={grouped}
                      hotelStars={hotelStars}
                      reviewScore={reviewScore}
                      selected={selected}
                      selectedSports={selectedSports}
                      setHotelStars={setHotelStars}
                      setReviewScore={setReviewScore}
                      setSportsOpen={setSportsOpen}
                      toMode={toMode}
                      toggle={toggle}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        <RecommendedOffers />
      </section>

      {/* AI filter modal */}
      {aiOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onMouseDown={() => setAiOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-pop"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue text-xl text-white">
                  ✨
                </span>
                <div>
                  <div className="font-display text-lg font-semibold">Nowy filtr AI</div>
                  <div className="text-xs text-muted-foreground">
                    AI zamieni opis w kryteria wyszukiwania
                  </div>
                </div>
              </div>
              <button onClick={() => setAiOpen(false)} className="rounded-full p-2 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="np. „stare miasto z bocznymi uliczkami, tanie wino i lokalne bary jazzowe"
              className="mt-5 h-32 w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm outline-none focus:border-brand-blue"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>Popularne:</span>
              {[
                "digital nomad friendly",
                "spot na surfing",
                "kraj bez wizy",
                "wegańska kuchnia",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setAiPrompt(s)}
                  className="rounded-full bg-muted px-3 py-1 hover:bg-brand-yellow-soft"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setAiOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium"
              >
                Anuluj
              </button>
              <button
                onClick={addCustom}
                className="rounded-full bg-brand-blue px-5 py-2 text-sm font-semibold text-white"
              >
                Dodaj filtr
              </button>
            </div>
          </div>
        </div>
      )}

      {fromOpen && (
        <FromModal
          selected={fromAirport}
          onClose={() => setFromOpen(false)}
          onSelect={(v) => {
            setFromAirport(v);
            setFromOpen(false);
          }}
        />
      )}

      {toOpen && (
        <ToModal
          mode={toMode}
          destinations={toDestinations}
          onClose={() => setToOpen(false)}
          onSave={(mode, destinations) => {
            setToMode(mode);
            setToDestinations(mode === "vibe" ? [] : destinations);
            if (mode !== "vibe" && filterTab === "destination") setFilterTab("hotel");
            setToOpen(false);
          }}
        />
      )}

      {guestsOpen && (
        <GuestsModal
          guests={guests}
          onClose={() => setGuestsOpen(false)}
          onSave={(nextGuests) => {
            setGuests(nextGuests);
            setGuestsOpen(false);
          }}
        />
      )}

      {sportsOpen && (
        <SportsModal
          selected={selectedSports}
          onClose={() => setSportsOpen(false)}
          onSave={(sports) => {
            setSelectedSports(sports);
            setSelected((current) =>
              sports.length > 0
                ? current.includes("active")
                  ? current
                  : [...current, "active"]
                : current.filter((id) => id !== "active"),
            );
            setSportsOpen(false);
          }}
        />
      )}

      {whenOpen && (
        <WhenModal
          mode={dateMode}
          start={dateStart}
          end={dateEnd}
          flexRange={flexRange}
          flexMonths={flexMonths}
          flexNights={flexNights}
          onClose={() => setWhenOpen(false)}
          onSave={(v) => {
            setDateMode(v.mode);
            setDateStart(v.start);
            setDateEnd(v.end);
            setFlexRange(v.flexRange);
            setFlexMonths(v.flexMonths);
            setFlexNights(v.flexNights);
            setWhenOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  col,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  col: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-left transition-colors hover:bg-muted ${col}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted group-hover:bg-background">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </button>
  );
}

function TripChatBox({
  prompt,
  setPrompt,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-background p-3 shadow-soft">
      <div className="flex items-center gap-3 rounded-2xl bg-card px-3 py-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-blue text-white">
          <MessageCircle className="h-4 w-4" />
        </span>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="np. Chcemy tani tydzień w czerwcu, ciepło 25°C+, hotel z basenem, dobre opinie, lot bez przesiadek i miasto z plażą."
        />
        <button
          type="button"
          disabled
          className="inline-flex shrink-0 cursor-not-allowed items-center gap-2 rounded-full bg-muted-foreground px-4 py-2 text-sm font-semibold text-white opacity-70"
        >
          <Lock className="h-4 w-4" />
          Wyszukaj
        </button>
      </div>
    </div>
  );
}

function FilterTabsPanel({
  activeTab,
  onTabClick,
  grouped,
  hotelStars,
  reviewScore,
  selected,
  selectedSports,
  setHotelStars,
  setReviewScore,
  setSportsOpen,
  toMode,
  toggle,
}: {
  activeTab: FilterTab | null;
  onTabClick: (tab: FilterTab) => void;
  grouped: Record<string, Vibe[]>;
  hotelStars: number | null;
  reviewScore: number | null;
  selected: string[];
  selectedSports: string[];
  setHotelStars: (value: number | null) => void;
  setReviewScore: (value: number | null) => void;
  setSportsOpen: (value: boolean) => void;
  toMode: DestinationMode;
  toggle: (id: string) => void;
}) {
  const destinationPills = [...grouped.destination, ...grouped.mood, ...grouped.climate];
  const lodgingPills = grouped.stay.filter((p) => LODGING_TYPES.includes(p.id));
  const standardPills = grouped.stay.filter((p) => !LODGING_TYPES.includes(p.id));
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
          className="inline-flex h-9 items-center rounded-full bg-foreground px-5 text-xs font-semibold text-background shadow-pop transition-transform hover:-translate-y-0.5"
        >
          Wyszukaj
        </Link>
      </div>

      {openTab && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-[1.5rem] border border-border bg-card px-4 py-3 shadow-pop">
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {activeLabel}
          </div>
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
                            const sport = SPORT_OPTIONS.find((option) => option.id === sportId);
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
                    Masz wybrane konkretne miejsce. Zmień je w polu “Dokąd” w górnym formularzu.
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
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-expanded={active}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors ${
        disabled
          ? "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
          : active
            ? "bg-foreground text-background shadow-soft"
            : "bg-muted text-foreground hover:bg-muted/70"
      }`}
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
      {pills.map((v) => (
        <VibePill
          key={v.id}
          emoji={v.emoji}
          label={v.label}
          tone={v.tone}
          active={selected.includes(v.id)}
          onClick={() => toggle(v.id)}
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
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
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

const RECOMMENDED_OFFER_IDS = ["r5", "r1", "r2", "r4"];
const DESTINATION_IMAGES: Record<string, string> = {
  Walencja:
    "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=720&q=75",
  Lizbona:
    "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=720&q=75",
  Split:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Split_080620-133710-IMG_0968x.jpg/1200px-Split_080620-133710-IMG_0968x.jpg",
  "Kreta — Chania":
    "https://images.unsplash.com/photo-1601581875039-e899893d520c?auto=format&fit=crop&w=720&q=75",
};

function RecommendedOffers() {
  const offers = RECOMMENDED_OFFER_IDS.flatMap((id) => {
    const offer = DEMO_RESULTS.find((item) => item.id === id);
    return offer ? [offer] : [];
  });
  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Polecane oferty</h2>
          <p className="text-sm text-muted-foreground">
            Przykładowe kierunki pasujące do aktualnego stylu wyszukiwania.
          </p>
        </div>
        <Link
          to="/results/$id"
          params={{ id: "demo" }}
          className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white"
        >
          Więcej ofert <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {offers.map((offer) => (
          <Link
            key={offer.id}
            to="/offer/$id"
            params={{ id: offer.id }}
            className="grid gap-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-colors hover:border-brand-blue/40 sm:grid-cols-[190px_1fr]"
          >
            <img
              src={DESTINATION_IMAGES[offer.destination] ?? DESTINATION_IMAGES.Lizbona}
              alt={offer.destination}
              className="h-44 w-full object-cover sm:h-full"
              loading="lazy"
            />
            <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <CountryFlag flag={offer.flag} label={offer.destination} />
                  <span>{offer.dates}</span>
                </div>
                <div className="mt-1 font-display text-xl font-bold">{offer.destination}</div>
                <div className="text-sm text-muted-foreground">{offer.hotel}</div>
              </div>
              <div className="rounded-2xl bg-brand-blue-soft px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue-ink">
                  Konkretny lot
                </div>
                <div className="mt-1 text-sm font-semibold">{offer.flight}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(offer.price * 0.42).toLocaleString("pl-PL")} PLN
                </div>
              </div>
              <div className="rounded-2xl bg-brand-green-soft px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-green-ink">
                  Konkretny tani nocleg
                </div>
                <div className="mt-1 text-sm font-semibold">{offer.hotel}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(offer.price * 0.58).toLocaleString("pl-PL")} PLN
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 pt-16 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-3xl border border-border bg-card p-6 shadow-pop`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-xl font-semibold">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FromModal({
  selected,
  onClose,
  onSelect,
}: {
  selected: { country: string; code: string; name: string };
  onClose: () => void;
  onSelect: (v: { country: string; code: string; name: string }) => void;
}) {
  const [country, setCountry] = useState<Country>(
    DEPARTURE_COUNTRIES.find((c) => c.name === selected.country) ?? DEPARTURE_COUNTRIES[0],
  );
  const [q, setQ] = useState("");
  const filtered = DEPARTURE_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <ModalShell
      wide
      title="Wybierz lotnisko wylotu"
      subtitle="Najpierw kraj, potem lotnisko"
      onClose={onClose}
    >
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj kraju…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Kraj wylotu
          </div>
          <div className="grid max-h-80 grid-cols-2 gap-1 overflow-y-auto pr-1">
            {filtered.map((c) => (
              <button
                key={c.code}
                onClick={() => setCountry(c)}
                className={`rounded-full px-3 py-1.5 text-left text-sm ${
                  country.code === c.code ? "bg-brand-blue text-white shadow-pop" : "hover:bg-muted"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <CountryFlag code={c.code} label={c.name} />
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-brand-blue-soft/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue-ink">
              Wybierz lotnisko
            </div>
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {country.airports.map((a) => {
              const active = selected.code === a.code;
              return (
                <button
                  key={a.code}
                  onClick={() => onSelect({ country: country.name, code: a.code, name: a.name })}
                  className={`flex w-full items-center justify-between rounded-full px-3 py-1.5 text-left text-sm ${
                    active ? "bg-brand-blue text-white shadow-pop" : "bg-background hover:bg-muted"
                  }`}
                >
                  <span>{a.name}</span>
                  <span className="text-xs opacity-70">{a.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function ToModal({
  mode,
  destinations,
  onClose,
  onSave,
}: {
  mode: DestinationMode;
  destinations: DestinationSelection[];
  onClose: () => void;
  onSave: (mode: DestinationMode, destinations: DestinationSelection[]) => void;
}) {
  const [m, setM] = useState<DestinationMode>(mode);
  const [selected, setSelected] = useState<DestinationSelection[]>(destinations);
  const [country, setCountry] = useState<DestinationCountry>(
    DESTINATION_COUNTRIES.find((c) => c.code === destinations[0]?.countryCode) ??
      DESTINATION_COUNTRIES[0],
  );
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filtered = DESTINATION_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.cities.some((city) => city.toLowerCase().includes(query)),
  );
  const hasSelection = (id: string) => selected.some((item) => item.id === id);
  const selectedCityCount = (countryCode: string) =>
    selected.filter((item) => item.type === "city" && item.countryCode === countryCode).length;
  const toggleSelection = (item: DestinationSelection) => {
    setSelected((current) =>
      current.some((selectedItem) => selectedItem.id === item.id)
        ? current.filter((selectedItem) => selectedItem.id !== item.id)
        : [...current, item],
    );
  };
  const removeSelection = (id: string) =>
    setSelected((current) => current.filter((item) => item.id !== id));

  return (
    <ModalShell
      wide
      title="Dokąd chcesz lecieć?"
      subtitle="AI dopasuje najlepsze miejsca do Twojego vibe"
      onClose={onClose}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          onClick={() => setM("vibe")}
          className={`rounded-2xl border-2 p-4 text-left ${m === "vibe" ? "border-brand-green bg-brand-green-soft/40" : "border-border hover:bg-muted"}`}
        >
          <div className="text-2xl">✨</div>
          <div className="mt-2 font-semibold">Wszędzie · dopasuj do vibe</div>
          <div className="text-xs text-muted-foreground">
            AI wybierze destynację pasującą do filtrów
          </div>
        </button>
        <button
          onClick={() => setM("specific")}
          className={`rounded-2xl border-2 p-4 text-left ${m === "specific" ? "border-brand-blue bg-brand-blue-soft/40" : "border-border hover:bg-muted"}`}
        >
          <div className="text-2xl">📍</div>
          <div className="mt-2 font-semibold">Konkretne miejsce</div>
          <div className="text-xs text-muted-foreground">Wybierz kraje i miasta</div>
        </button>
      </div>

      {m === "specific" && (
        <div className="mt-4">
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Szukaj kraju lub miasta…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.15fr]">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kraj
              </div>
              <div className="grid max-h-80 grid-cols-1 gap-1 overflow-y-auto pr-1">
                {filtered.map((c) => {
                  const count = selectedCityCount(c.code);
                  const countryItem = getDestinationItem(c);
                  const active = country.code === c.code;
                  const selectedCountry = hasSelection(countryItem.id);
                  return (
                    <div key={c.code} className="flex items-center gap-1">
                      <button
                        onClick={() => setCountry(c)}
                        className={`min-w-0 flex-1 rounded-full px-3 py-1.5 text-left text-sm ${
                          active ? "bg-brand-blue-soft text-brand-blue-ink" : "hover:bg-muted"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <CountryFlag code={c.code} label={c.name} />
                          {c.name}
                        </span>
                        {count > 0 && <span className="ml-1 text-xs opacity-75">+{count}</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCountry(c);
                          toggleSelection(countryItem);
                        }}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                          selectedCountry
                            ? "border-brand-blue bg-brand-blue text-white shadow-pop"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                        aria-label={`${selectedCountry ? "Usuń" : "Dodaj"} kraj ${c.name}`}
                      >
                        {selectedCountry ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-brand-blue-soft/30 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue-ink">
                    Wybierz miejsca
                  </div>
                  <div className="text-sm font-semibold">
                    <span className="inline-flex items-center gap-2">
                      <CountryFlag code={country.code} label={country.name} />
                      {country.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleSelection(getDestinationItem(country))}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    hasSelection(`country:${country.code}`)
                      ? "bg-brand-blue text-white shadow-pop"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {hasSelection(`country:${country.code}`) ? "Wybrano kraj" : "Dodaj kraj"}
                </button>
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {country.cities.map((city) => {
                  const item = getDestinationItem(country, city);
                  const active = hasSelection(item.id);
                  return (
                    <button
                      key={city}
                      onClick={() => toggleSelection(item)}
                      className={`flex w-full items-center justify-between rounded-full px-3 py-1.5 text-left text-sm ${
                        active
                          ? "bg-brand-blue text-white shadow-pop"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      <span>{city}</span>
                      {active && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wybrane miejsca
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selected.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  Nie wybrano jeszcze kraju ani miasta
                </span>
              )}
              {selected.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                >
                  <CountryFlag code={item.countryCode} label={item.country} />
                  {item.type === "country" ? item.name : `${item.name}, ${item.country}`}
                  <button
                    onClick={() => removeSelection(item.id)}
                    className="ml-1 rounded-full hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium"
        >
          Anuluj
        </button>
        <button
          onClick={() => onSave(m, m === "vibe" ? [] : selected)}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"
        >
          Zapisz
        </button>
      </div>
    </ModalShell>
  );
}

function SportsModal({
  selected,
  onClose,
  onSave,
}: {
  selected: string[];
  onClose: () => void;
  onSave: (sports: string[]) => void;
}) {
  const [nextSelected, setNextSelected] = useState<string[]>(selected);
  const toggleSport = (id: string) =>
    setNextSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <ModalShell
      wide
      title="Aktywnie"
      subtitle="Wybierz sporty, które mają być dostępne w konkretnym miejscu"
      onClose={onClose}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {SPORT_OPTIONS.map((sport) => {
          const active = nextSelected.includes(sport.id);
          return (
            <button
              key={sport.id}
              type="button"
              onClick={() => toggleSport(sport.id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                active
                  ? "border-brand-green bg-brand-green-soft/50 shadow-pop"
                  : "border-border bg-background hover:bg-muted"
              }`}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{sport.label}</div>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    active ? "border-brand-green bg-brand-green text-white" : "border-border"
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Miejsca: {sport.places.join(", ")}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium"
        >
          Anuluj
        </button>
        <button
          onClick={() => onSave(nextSelected)}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"
        >
          Zapisz
        </button>
      </div>
    </ModalShell>
  );
}

function GuestsModal({
  guests,
  onClose,
  onSave,
}: {
  guests: GuestCounts;
  onClose: () => void;
  onSave: (guests: GuestCounts) => void;
}) {
  const [nextGuests, setNextGuests] = useState<GuestCounts>(guests);
  const setCount = (key: keyof GuestCounts, value: number) => {
    const minimum = key === "children" ? 0 : 1;
    const maximum = key === "rooms" ? 8 : 12;
    setNextGuests((current) => ({
      ...current,
      [key]: Math.min(maximum, Math.max(minimum, value)),
    }));
  };

  return (
    <ModalShell title="Kto leci?" subtitle="Ustaw liczbę podróżnych i pokojów" onClose={onClose}>
      <div className="space-y-3">
        <CounterRow
          label="Dorośli"
          caption="Osoby od 18 lat"
          value={nextGuests.adults}
          min={1}
          max={12}
          onChange={(value) => setCount("adults", value)}
        />
        <CounterRow
          label="Dzieci"
          caption="Osoby poniżej 18 lat"
          value={nextGuests.children}
          min={0}
          max={12}
          onChange={(value) => setCount("children", value)}
        />
        <CounterRow
          label="Pokoje"
          caption="Liczba pokoi w hotelu"
          value={nextGuests.rooms}
          min={1}
          max={8}
          onChange={(value) => setCount("rooms", value)}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-muted px-4 py-3 text-sm">
        <span className="font-semibold">Podsumowanie: </span>
        {formatGuests(nextGuests)}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium"
        >
          Anuluj
        </button>
        <button
          onClick={() => onSave(nextGuests)}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"
        >
          Zapisz
        </button>
      </div>
    </ModalShell>
  );
}

function CounterRow({
  label,
  caption,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  caption: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4">
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{caption}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Zmniejsz: ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Zwiększ: ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DateRangeCalendar({
  monthValue,
  start,
  end,
  activeField,
  onSelect,
}: {
  monthValue: string;
  start: string;
  end: string;
  activeField: "start" | "end";
  onSelect: (value: string) => void;
}) {
  const [year, month] = monthValue.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlankDays = (firstDay.getDay() + 6) % 7;
  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlankDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) =>
      formatISODate(new Date(year, month - 1, index + 1)),
    ),
  ];

  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} />;
          const dayNumber = Number(date.slice(-2));
          const isStart = date === start;
          const isEnd = date === end;
          const inRange = date > start && date < end;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              className={`aspect-square rounded-xl text-sm font-semibold transition-colors ${
                isStart || isEnd
                  ? "bg-brand-blue text-white shadow-pop"
                  : inRange
                    ? "bg-brand-blue-soft text-brand-blue-ink"
                    : "hover:bg-muted"
              }`}
              aria-pressed={activeField === "start" ? isStart : isEnd}
            >
              {dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WhenModal({
  mode,
  start,
  end,
  flexRange,
  flexMonths,
  flexNights,
  onClose,
  onSave,
}: {
  mode: "exact" | "flex";
  start: string;
  end: string;
  flexRange: number;
  flexMonths: string[];
  flexNights: number;
  onClose: () => void;
  onSave: (v: {
    mode: "exact" | "flex";
    start: string;
    end: string;
    flexRange: number;
    flexMonths: string[];
    flexNights: number;
  }) => void;
}) {
  const [m, setM] = useState(mode);
  const [s, setS] = useState(start);
  const [e, setE] = useState(end);
  const [fr, setFr] = useState(flexRange);
  const [selectedFlexMonths, setSelectedFlexMonths] = useState<string[]>(flexMonths);
  const [flexYear, setFlexYear] = useState(
    Number(flexMonths[0]?.match(/\d{4}/)?.[0]) || FLEX_YEARS[0],
  );
  const [fn, setFn] = useState(flexNights);
  const [exactMonth, setExactMonth] = useState(start.slice(0, 7));
  const [activeDateField, setActiveDateField] = useState<"start" | "end">("start");
  const selectExactDate = (value: string) => {
    if (activeDateField === "start") {
      setS(value);
      if (value > e) setE(value);
      setActiveDateField("end");
      return;
    }
    if (value < s) {
      setS(value);
      setE(s);
    } else {
      setE(value);
    }
    setActiveDateField("start");
  };
  const toggleFlexMonth = (label: string) => {
    setSelectedFlexMonths((current) =>
      current.includes(label) ? current.filter((month) => month !== label) : [...current, label],
    );
  };

  return (
    <ModalShell
      title="Kiedy lecimy?"
      subtitle="Dokładny termin lub elastyczne okno"
      onClose={onClose}
    >
      <div className="mb-4 flex gap-2 rounded-full bg-muted p-1">
        <button
          onClick={() => setM("exact")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${m === "exact" ? "bg-background shadow-pop" : "text-muted-foreground"}`}
        >
          Dokładne daty
        </button>
        <button
          onClick={() => setM("flex")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${m === "flex" ? "bg-background shadow-pop" : "text-muted-foreground"}`}
        >
          Elastyczne
        </button>
      </div>
      {m === "exact" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveDateField("start")}
              className={`rounded-2xl border p-3 text-left ${
                activeDateField === "start"
                  ? "border-brand-blue bg-brand-blue-soft/40"
                  : "border-border bg-background"
              }`}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Wylot
              </div>
              <div className="mt-1 text-sm font-semibold">{formatShortDate(s)}</div>
            </button>
            <button
              type="button"
              onClick={() => setActiveDateField("end")}
              className={`rounded-2xl border p-3 text-left ${
                activeDateField === "end"
                  ? "border-brand-blue bg-brand-blue-soft/40"
                  : "border-border bg-background"
              }`}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Powrót
              </div>
              <div className="mt-1 text-sm font-semibold">{formatShortDate(e)}</div>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FLEX_MONTHS.map((month) => (
              <button
                key={month.value}
                type="button"
                onClick={() => setExactMonth(month.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  exactMonth === month.value
                    ? "bg-brand-blue text-white shadow-pop"
                    : "bg-muted hover:bg-brand-blue-soft"
                }`}
              >
                {month.label.replace(" 2026", "")}
              </button>
            ))}
          </div>
          <DateRangeCalendar
            monthValue={exactMonth}
            start={s}
            end={e}
            activeField={activeDateField}
            onSelect={selectExactDate}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rok
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FLEX_YEARS.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    setFlexYear(year);
                    setSelectedFlexMonths([]);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    flexYear === year
                      ? "bg-brand-blue text-white shadow-pop"
                      : "bg-muted hover:bg-brand-blue-soft"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Miesiące
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MONTH_NAMES.map((name, index) => {
                const label = monthLabel(flexYear, index);
                const active = selectedFlexMonths.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleFlexMonth(label)}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm font-semibold ${
                      active
                        ? "border-brand-blue bg-brand-blue text-white shadow-pop"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                    aria-pressed={active}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
            <span className="font-semibold">Wybrane: </span>
            {selectedFlexMonths.length > 0
              ? summarizeList(selectedFlexMonths, 4)
              : "wybierz co najmniej jeden miesiąc"}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Liczba nocy</span>
              <span className="text-brand-blue">{fn}</span>
            </div>
            <input
              type="range"
              min={2}
              max={21}
              value={fn}
              onChange={(ev) => setFn(+ev.target.value)}
              className="w-full accent-[oklch(0.62_0.20_245)]"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Elastyczność</span>
              <span className="text-brand-green">±{fr} dni</span>
            </div>
            <input
              type="range"
              min={0}
              max={7}
              value={fr}
              onChange={(ev) => setFr(+ev.target.value)}
              className="w-full accent-[oklch(0.70_0.18_155)]"
            />
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium"
        >
          Anuluj
        </button>
        <button
          onClick={() =>
            onSave({
              mode: m,
              start: s,
              end: e,
              flexRange: fr,
              flexMonths: selectedFlexMonths,
              flexNights: fn,
            })
          }
          className="inline-flex items-center gap-1 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"
        >
          <Check className="h-4 w-4" /> Zapisz
        </button>
      </div>
    </ModalShell>
  );
}
