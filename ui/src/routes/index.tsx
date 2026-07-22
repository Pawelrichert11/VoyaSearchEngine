import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  Compass,
  Lock,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  Minus,
  PlaneTakeoff,
  Plus,
  Search,
  Snowflake,
  Sparkles,
  Star,
  UtensilsCrossed,
  Users,
  Waves,
  Wifi,
  X,
} from "lucide-react";
import { TopBar } from "@/components/voya/TopBar";
import { CountryFlag } from "@/components/voya/CountryFlag";
import { RotatingHero } from "@/components/voya/RotatingHero";
import { SearchFilterPanel, type SearchFilterTab } from "@/components/voya/SearchFilterPanel";
import { voya } from "@/components/voya/style-system";
import { RECOMMENDED_OFFERS, type RecommendedAmenity } from "@/lib/recommended-offers";
import { cn } from "@/lib/utils";
import { VIBES, DEPARTURE_COUNTRIES, type Vibe, type Country } from "@/lib/voya-data";

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
type SportOption = { id: string; label: string };

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

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
  { id: "kitesurfing", label: "Kitesurfing" },
  { id: "windsurfing", label: "Windsurfing" },
  { id: "surfing", label: "Surfing" },
  { id: "skiing", label: "Narty" },
  { id: "diving", label: "Nurkowanie" },
  { id: "trekking", label: "Trekking" },
  { id: "cycling", label: "Rower" },
];

const VIBE_GROUPS = VIBES.reduce<Record<Vibe["category"], Vibe[]>>(
  (groups, vibe) => {
    groups[vibe.category].push(vibe);
    return groups;
  },
  {
    mood: [],
    climate: [],
    budget: [],
    stay: [],
    ai: [],
    destination: [],
    flight: [],
  },
);

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

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") return null;
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
};

function SearchHome() {
  const [searchMode, setSearchMode] = useState<SearchMode>("chat");
  const [filterTab, setFilterTab] = useState<SearchFilterTab | null>(null);
  const [tripPrompt, setTripPrompt] = useState("");
  const [selected, setSelected] = useState<string[]>(["pool", "party", "sun", "direct"]);

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
  const [hotelMinPrice, setHotelMinPrice] = useState<number | null>(null);
  const [hotelMaxPrice, setHotelMaxPrice] = useState<number | null>(null);

  // Aktywnie
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const toggle = (id: string) => {
    const exclusiveGroup = ["direct", "onestop"].includes(id)
      ? ["direct", "onestop"]
      : ["warm", "snow"].includes(id)
        ? ["warm", "snow"]
        : null;
    setSelected((s) => {
      if (exclusiveGroup) {
        return s.includes(id)
          ? s.filter((x) => x !== id)
          : [...s.filter((x) => !exclusiveGroup.includes(x)), id];
      }
      return s.includes(id) ? s.filter((x) => x !== id) : [...s, id];
    });
  };

  const toggleSport = (id: string) =>
    setSelectedSports((current) =>
      current.includes(id) ? current.filter((sportId) => sportId !== id) : [...current, id],
    );

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
      <section className="relative z-20 overflow-visible">
        <RotatingHero />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-6xl">
              Opisz trip,
              <br />a Voya znajdzie lot + nocleg
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Opisz wyjazd jednym zdaniem albo ustaw filtry ręcznie. Voya porówna loty i noclegi w
              katalogu, który możesz sortować, komentować i udostępnić ekipie.
            </p>
          </div>

          {/* Search card */}
          <div className="relative z-50 mx-auto mt-10 max-w-7xl">
            <div className={voya.heroCard}>
              <div className="mb-3 flex rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setSearchMode("chat")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                    searchMode === "chat"
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("filters")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
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
                        icon={<MapPin className="h-4 w-4 text-foreground" />}
                        label="Skąd"
                        value={`${fromAirport.name} (${fromAirport.code})`}
                        col="sm:col-span-3"
                        onClick={() => setFromOpen(true)}
                      />
                      <Field
                        icon={<ArrowRight className="h-4 w-4 text-foreground" />}
                        label="Dokąd"
                        value={toLabel}
                        col="sm:col-span-4"
                        onClick={() => setToOpen(true)}
                      />
                      <Field
                        icon={<CalendarDays className="h-4 w-4 text-foreground" />}
                        label="Kiedy"
                        value={whenLabel}
                        col="sm:col-span-3"
                        onClick={() => setWhenOpen(true)}
                      />
                      <Field
                        icon={<Users className="h-4 w-4 text-foreground" />}
                        label="Kto"
                        value={guestsLabel}
                        col="sm:col-span-2"
                        onClick={() => setGuestsOpen(true)}
                      />
                    </div>
                    <SearchFilterPanel
                      activeTab={filterTab}
                      onTabClick={(tab) =>
                        setFilterTab((current) => (current === tab ? null : tab))
                      }
                      grouped={VIBE_GROUPS}
                      hotelMaxPrice={hotelMaxPrice}
                      hotelMinPrice={hotelMinPrice}
                      hotelStars={hotelStars}
                      lodgingTypeIds={LODGING_TYPES}
                      selected={selected}
                      selectedSports={selectedSports}
                      setHotelMaxPrice={setHotelMaxPrice}
                      setHotelMinPrice={setHotelMinPrice}
                      setHotelStars={setHotelStars}
                      sportOptions={SPORT_OPTIONS}
                      toMode={toMode}
                      toggle={toggle}
                      toggleSport={toggleSport}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-0 mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        <RecommendedOffers />
      </section>

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
    <button onClick={onClick} className={cn(voya.field, col)}>
      <span className={voya.iconBox}>{icon}</span>
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
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(
    () => () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      }
      recognitionRef.current = null;
    },
    [],
  );

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSpeechFeedback(
        "Dyktowanie nie jest dostępne w tej przeglądarce. Nadal możesz wpisać opis ręcznie.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    const promptBeforeSpeech = prompt.trim();
    recognition.lang = "pl-PL";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index]?.[0]?.transcript ?? "";
      }
      const spokenText = transcript.trim();
      if (!spokenText) return;
      setPrompt([promptBeforeSpeech, spokenText].filter(Boolean).join(" "));
      setSpeechFeedback("Dodano tekst z mikrofonu.");
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setSpeechFeedback("Zezwól przeglądarce na dostęp do mikrofonu, aby użyć dyktowania.");
      } else if (event.error === "no-speech") {
        setSpeechFeedback("Nie usłyszano mowy. Spróbuj ponownie albo wpisz opis ręcznie.");
      } else if (event.error === "audio-capture") {
        setSpeechFeedback("Nie znaleziono działającego mikrofonu.");
      } else {
        setSpeechFeedback("Nie udało się uruchomić dyktowania. Możesz wpisać opis ręcznie.");
      }
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setIsListening(false);
      setSpeechFeedback((current) =>
        current === "Nasłuchuję…" ? "Dyktowanie zakończone." : current,
      );
    };

    recognitionRef.current = recognition;
    setSpeechFeedback("Nasłuchuję…");
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setSpeechFeedback("Nie udało się uruchomić mikrofonu. Możesz wpisać opis ręcznie.");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-background p-3 shadow-soft">
      <div className="flex items-center gap-3 rounded-lg bg-card px-3 py-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-blue text-white">
          <MessageCircle className="h-4 w-4" />
        </span>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          aria-label="Opis wyjazdu"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="np. Chcemy tani tydzień w czerwcu, ciepło 25°C+, hotel z basenem, dobre opinie, lot bez przesiadek i miasto z plażą."
        />
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? "Zatrzymaj dyktowanie" : "Dyktuj opis wyjazdu"}
          aria-pressed={isListening}
          title={isListening ? "Zatrzymaj dyktowanie" : "Dyktuj opis wyjazdu"}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isListening
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-foreground hover:bg-muted",
          )}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <button
          type="button"
          disabled
          className="inline-flex shrink-0 cursor-not-allowed items-center gap-2 rounded-lg bg-muted-foreground px-4 py-2 text-sm font-semibold text-white opacity-70"
        >
          <Lock className="h-4 w-4" />
          Wyszukaj
        </button>
      </div>
      {speechFeedback && (
        <div className="px-3 pt-2 text-xs text-muted-foreground" role="status" aria-live="polite">
          {speechFeedback}
        </div>
      )}
    </div>
  );
}

const INITIAL_RECOMMENDED_COUNT = 12;
const RECOMMENDED_BATCH_SIZE = 12;

const RECOMMENDED_AMENITIES: Record<
  RecommendedAmenity,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  "air-conditioning": { label: "Klimatyzacja", Icon: Snowflake },
  "all-inclusive": { label: "All inclusive", Icon: UtensilsCrossed },
  breakfast: { label: "Śniadanie", Icon: Coffee },
  parking: { label: "Parking", Icon: Car },
  pool: { label: "Basen", Icon: Waves },
  spa: { label: "SPA", Icon: Sparkles },
  wifi: { label: "Wi-Fi", Icon: Wifi },
};

function RecommendedOfferGallery({
  images,
  hotel,
  detailId,
}: {
  images: readonly string[];
  hotel: string;
  detailId: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const selectPrevious = () =>
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  const selectNext = () => setActiveIndex((current) => (current + 1) % images.length);

  return (
    <div className="relative h-[15.5rem] overflow-hidden bg-muted xl:h-full">
      <img
        key={images[activeIndex]}
        src={images[activeIndex]}
        alt={`Zdjęcie ${activeIndex + 1} z ${images.length} hotelu ${hotel}`}
        width={1200}
        height={800}
        className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.025]"
        loading="lazy"
        decoding="async"
      />
      <Link
        to="/offer/$id"
        params={{ id: detailId }}
        className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
      >
        <span className="sr-only">Otwórz ofertę hotelu {hotel}</span>
      </Link>

      <div className="absolute inset-x-3 top-1/2 z-20 flex -translate-y-1/2 justify-between">
        <button
          type="button"
          onClick={selectPrevious}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/55 text-white shadow-soft backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={`Poprzednie zdjęcie hotelu ${hotel}`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={selectNext}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/55 text-white shadow-soft backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={`Następne zdjęcie hotelu ${hotel}`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 backdrop-blur-sm">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-1.5 rounded-full bg-white/55 transition-[width,background-color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              index === activeIndex ? "w-4 bg-white" : "w-1.5 hover:bg-white/80",
            )}
            aria-label={`Pokaż zdjęcie ${index + 1} z ${images.length}`}
            aria-pressed={index === activeIndex}
          />
        ))}
      </div>

      <span
        className="absolute right-3 top-3 z-20 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
        aria-live="polite"
      >
        {activeIndex + 1}/{images.length}
      </span>
    </div>
  );
}

function RecommendedOffers() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_RECOMMENDED_COUNT);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const hasMore = visibleCount < RECOMMENDED_OFFERS.length;
  const visibleOffers = RECOMMENDED_OFFERS.slice(0, visibleCount);

  useEffect(() => {
    const updateBackToTop = () => setShowBackToTop(window.scrollY > 1200);
    updateBackToTop();
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    return () => window.removeEventListener("scroll", updateBackToTop);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisibleCount(RECOMMENDED_OFFERS.length);
      return;
    }

    let loadTimer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingRef.current) return;

        loadingRef.current = true;
        setIsLoading(true);
        loadTimer = window.setTimeout(() => {
          setVisibleCount((current) =>
            Math.min(current + RECOMMENDED_BATCH_SIZE, RECOMMENDED_OFFERS.length),
          );
          loadingRef.current = false;
          setIsLoading(false);
        }, 240);
      },
      { rootMargin: "320px 0px", threshold: 0.01 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (loadTimer !== undefined) window.clearTimeout(loadTimer);
      loadingRef.current = false;
    };
  }, [hasMore, visibleCount]);

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Polecane oferty</h2>
          <p className="text-sm text-muted-foreground">
            {RECOMMENDED_OFFERS.length} przykładowe oferty pasujące do aktualnego stylu
            wyszukiwania.
          </p>
        </div>
        <div className="text-xs font-medium text-muted-foreground" aria-live="polite">
          Wyświetlono {visibleOffers.length} z {RECOMMENDED_OFFERS.length}
        </div>
      </div>
      <div className="grid auto-rows-fr gap-4">
        {visibleOffers.map((offer) => (
          <article
            key={offer.id}
            className="group grid h-full min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-[border-color,box-shadow] hover:border-foreground/25 hover:shadow-pop xl:h-[275px] xl:grid-cols-[38.4%_36.2%_25.4%]"
          >
            <RecommendedOfferGallery
              images={offer.images}
              hotel={offer.hotel}
              detailId={offer.detailId}
            />

            <div className="flex min-w-0 flex-col p-5 xl:p-6">
              <div>
                <h3 className="font-display text-xl font-bold leading-tight tracking-tight">
                  <Link
                    to="/offer/$id"
                    params={{ id: offer.detailId }}
                    className="rounded-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {offer.hotel}
                  </Link>
                </h3>
                <div
                  className="mt-2 flex items-center gap-1 text-foreground"
                  aria-label={`${offer.hotelStars} gwiazdek`}
                >
                  {Array.from({ length: offer.hotelStars }, (_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CountryFlag code={offer.countryCode} label={offer.country} />
                <span>
                  {offer.country} / {offer.destination}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Udogodnienia hotelu">
                {offer.amenities.map((amenity) => {
                  const { Icon, label } = RECOMMENDED_AMENITIES[amenity];
                  return (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {label}
                    </span>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <div className="flex items-start gap-2.5">
                  <PlaneTakeoff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Wylot: </span>
                    <span className="font-semibold">{offer.departure}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Termin: </span>
                    <span className="font-semibold">
                      {offer.dates} · {offer.nights} nocy
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="font-medium">{offer.flight}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-t border-border p-6 text-center xl:border-l xl:border-t-0">
              <div className="font-display text-3xl font-bold tracking-tight">
                {offer.price.toLocaleString("pl-PL")} zł
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Cena za osobę</div>
              <Link
                to="/offer/$id"
                params={{ id: offer.detailId }}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Zobacz ofertę
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Compass className="h-3.5 w-3.5" />
                {offer.destination}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div
        ref={sentinelRef}
        className="flex min-h-20 items-center justify-center py-5 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {hasMore ? (
          <span className="inline-flex items-center gap-2">
            <span
              className={cn("h-1.5 w-1.5 rounded-full bg-brand-blue", isLoading && "animate-pulse")}
            />
            {isLoading ? "Wczytuję kolejne oferty…" : "Przewiń niżej po kolejne oferty"}
          </span>
        ) : (
          <span>To już wszystkie {RECOMMENDED_OFFERS.length} oferty.</span>
        )}
      </div>
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-pop transition-[opacity,transform] hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          aria-label="Wróć na górę strony"
        >
          <ArrowUp className="h-4 w-4" />
          <span className="hidden sm:inline">Wróć na górę</span>
        </button>
      )}
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
        className={cn("w-full p-6", wide ? "max-w-3xl" : "max-w-lg", voya.surfacePop)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-xl font-semibold">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
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
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
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
                className={`rounded-md px-3 py-1.5 text-left text-sm ${
                  country.code === c.code
                    ? "bg-foreground text-background shadow-pop"
                    : "hover:bg-muted"
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
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
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
                  className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm ${
                    active
                      ? "bg-foreground text-background shadow-pop"
                      : "bg-background hover:bg-muted"
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
  const selectCityAndClose = (item: DestinationSelection) => {
    const next = hasSelection(item.id) ? selected : [...selected, item];
    onSave("specific", next);
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
          className={`rounded-lg border p-4 text-left ${m === "vibe" ? "border-foreground bg-muted" : "border-border hover:bg-muted"}`}
        >
          <Sparkles className="h-5 w-5" />
          <div className="mt-2 font-semibold">Wszędzie · dopasuj do vibe</div>
          <div className="text-xs text-muted-foreground">
            AI wybierze destynację pasującą do filtrów
          </div>
        </button>
        <button
          onClick={() => setM("specific")}
          className={`rounded-lg border p-4 text-left ${m === "specific" ? "border-foreground bg-muted" : "border-border hover:bg-muted"}`}
        >
          <MapPin className="h-5 w-5" />
          <div className="mt-2 font-semibold">Konkretne miejsce</div>
          <div className="text-xs text-muted-foreground">Wybierz kraje i miasta</div>
        </button>
      </div>

      {m === "specific" && (
        <div className="mt-4">
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
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
                        className={`min-w-0 flex-1 rounded-md px-3 py-1.5 text-left text-sm ${
                          active ? "bg-muted text-foreground" : "hover:bg-muted"
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
                            ? "border-foreground bg-foreground text-background shadow-pop"
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

            <div className="rounded-lg border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
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
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    hasSelection(`country:${country.code}`)
                      ? "bg-foreground text-background shadow-pop"
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
                      onClick={() => selectCityAndClose(item)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm ${
                        active
                          ? "bg-foreground text-background shadow-pop"
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

          <div className="mt-4 rounded-lg border border-border bg-background p-3">
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
                  className="inline-flex items-center rounded-md bg-muted text-xs"
                >
                  <button
                    type="button"
                    onClick={() => onSave("specific", selected)}
                    className="inline-flex items-center gap-1 rounded-l-full py-1 pl-3 pr-1 hover:bg-foreground/5"
                  >
                    <CountryFlag code={item.countryCode} label={item.country} />
                    {item.type === "country" ? item.name : `${item.name}, ${item.country}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSelection(item.id)}
                    className="rounded-md p-1.5 hover:bg-background"
                    aria-label={`Usuń ${item.name}`}
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
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
        >
          Anuluj
        </button>
        <button
          onClick={() => onSave(m, m === "vibe" ? [] : selected)}
          className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white hover:brightness-105"
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

      <div className="mt-5 rounded-lg bg-muted px-4 py-3 text-sm">
        <span className="font-semibold">Podsumowanie: </span>
        {formatGuests(nextGuests)}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
        >
          Anuluj
        </button>
        <button
          onClick={() => onSave(nextGuests)}
          className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white hover:brightness-105"
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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4">
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{caption}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Zmniejsz: ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card disabled:cursor-not-allowed disabled:opacity-40"
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
    <div className="rounded-lg border border-border bg-background p-3">
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
                  ? "bg-foreground text-background shadow-pop"
                  : inRange
                    ? "bg-muted text-foreground"
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
      <div className="mb-4 flex gap-2 rounded-lg bg-muted p-1">
        <button
          onClick={() => setM("exact")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${m === "exact" ? "bg-background shadow-pop" : "text-muted-foreground"}`}
        >
          Dokładne daty
        </button>
        <button
          onClick={() => setM("flex")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${m === "flex" ? "bg-background shadow-pop" : "text-muted-foreground"}`}
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
              className={`rounded-lg border p-3 text-left ${
                activeDateField === "start"
                  ? "border-foreground bg-muted"
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
              className={`rounded-lg border p-3 text-left ${
                activeDateField === "end"
                  ? "border-foreground bg-muted"
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
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  exactMonth === month.value
                    ? "bg-foreground text-background shadow-pop"
                    : "bg-muted hover:bg-foreground/10"
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
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    flexYear === year
                      ? "bg-foreground text-background shadow-pop"
                      : "bg-muted hover:bg-foreground/10"
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
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                      active
                        ? "border-foreground bg-foreground text-background shadow-pop"
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
          <div className="rounded-lg bg-muted px-4 py-3 text-sm">
            <span className="font-semibold">Wybrane: </span>
            {selectedFlexMonths.length > 0
              ? summarizeList(selectedFlexMonths, 4)
              : "wybierz co najmniej jeden miesiąc"}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Liczba nocy</span>
              <span className="text-foreground">{fn}</span>
            </div>
            <input
              type="range"
              min={2}
              max={21}
              value={fn}
              onChange={(ev) => setFn(+ev.target.value)}
              className="w-full accent-foreground"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Elastyczność</span>
              <span className="text-foreground">±{fr} dni</span>
            </div>
            <input
              type="range"
              min={0}
              max={7}
              value={fr}
              onChange={(ev) => setFr(+ev.target.value)}
              className="w-full accent-foreground"
            />
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
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
          className="inline-flex items-center gap-1 rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white hover:brightness-105"
        >
          <Check className="h-4 w-4" /> Zapisz
        </button>
      </div>
    </ModalShell>
  );
}
