import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Filter,
  Map,
  Maximize2,
  MessageCircle,
  Minimize2,
  PlaneTakeoff,
  RefreshCw,
  Share2,
  Table2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TopBar } from "@/components/voya/TopBar";
import { CountryFlag } from "@/components/voya/CountryFlag";
import { StarThresholdPicker } from "@/components/voya/StarThresholdPicker";
import { VibePill } from "@/components/voya/VibePill";
import { voyaButtonVariants } from "@/components/voya/style-system";
import { cn } from "@/lib/utils";
import { VIBES, type Vibe } from "@/lib/voya-data";
import { fetchVoyaOffers, type VoyaResultRow } from "@/lib/voya-search";
import { authClient } from "@/lib/auth/auth-client";

export const Route = createFileRoute("/results/$id")({
  component: ResultsSheet,
  head: () => ({
    meta: [
      { title: "Wyniki · Voya" },
      { name: "description", content: "MVP katalogu wynikow z VoyaSearchEngine." },
    ],
  }),
});

const statusMeta = {
  loved: { label: "Bierzemy", tone: "bg-brand-green-soft text-brand-green-ink" },
  maybe: { label: "Może", tone: "bg-brand-yellow-soft text-brand-yellow-ink" },
  pending: { label: "Do sprawdzenia", tone: "bg-muted text-muted-foreground" },
  no: { label: "Odpada", tone: "bg-brand-pink-soft text-foreground" },
} as const;

const rowTone: Record<VoyaResultRow["status"], string> = {
  loved: "bg-brand-green-soft/40 hover:bg-brand-green-soft/60",
  maybe: "bg-brand-yellow-soft/40 hover:bg-brand-yellow-soft/60",
  pending: "hover:bg-muted/40",
  no: "bg-destructive/10 hover:bg-destructive/15",
};

const PAGE_SIZE = 5;
const STATUS_OPTIONS: VoyaResultRow["status"][] = ["loved", "maybe", "pending", "no"];
const LODGING_TYPES = ["hotel", "apartment", "resort", "hostel", "glamping", "bnb", "boutique"];

type MapPoint = { x: number; y: number; airport: string };
type WeatherOption = {
  emoji: string;
  label: string;
  averageTemperature: number;
  highestTemperature: number;
  rainyDays: number;
};
type PriceSort = "none" | "asc" | "desc";
type InteractionUser = { id: string; name: string };
type OfferComment = {
  id: string;
  author: InteractionUser;
  body: string;
};
type OfferInteractions = {
  likes: InteractionUser[];
  unlikes: InteractionUser[];
  comments: OfferComment[];
};

const INTERACTIONS_STORAGE_KEY = "voya.offer-interactions.v1";

function loadStoredInteractions(): Record<string, OfferInteractions> {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(INTERACTIONS_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, OfferInteractions>;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

const ORIGIN_POINT: MapPoint = { x: 48, y: 35, airport: "WAW" };
const MAP_POINTS: Record<string, MapPoint> = {
  Lizbona: { x: 18, y: 63, airport: "LIS" },
  Split: { x: 58, y: 53, airport: "SPU" },
  "Palma de Mallorca": { x: 39, y: 62, airport: "PMI" },
  "Kreta — Chania": { x: 70, y: 73, airport: "CHQ" },
  Walencja: { x: 35, y: 63, airport: "VLC" },
  Marrakesz: { x: 24, y: 82, airport: "RAK" },
};

const DESTINATION_IMAGE_URLS: Record<string, string> = {
  lisbon:
    "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=480&q=75",
  split:
    "https://images.pexels.com/photos/28142401/pexels-photo-28142401.jpeg?auto=compress&cs=tinysrgb&w=480",
  palma:
    "https://images.pexels.com/photos/32077754/pexels-photo-32077754.jpeg?auto=compress&cs=tinysrgb&w=480",
  chania:
    "https://images.unsplash.com/photo-1601581875039-e899893d520c?auto=format&fit=crop&w=480&q=75",
  valencia:
    "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=480&q=75",
  marrakesh:
    "https://images.pexels.com/photos/20066999/pexels-photo-20066999.jpeg?auto=compress&cs=tinysrgb&w=480",
  malaga:
    "https://images.pexels.com/photos/35894600/pexels-photo-35894600.jpeg?auto=compress&cs=tinysrgb&w=480",
  alicante:
    "https://images.pexels.com/photos/36006596/pexels-photo-36006596.jpeg?auto=compress&cs=tinysrgb&w=480",
};

const DESTINATION_IMAGE_ALIASES: Record<string, string> = {
  lizbona: "lisbon",
  lisbon: "lisbon",
  lis: "lisbon",
  split: "split",
  spu: "split",
  "palma de mallorca": "palma",
  palma: "palma",
  mallorca: "palma",
  pmi: "palma",
  "kreta - chania": "chania",
  chania: "chania",
  crete: "chania",
  chq: "chania",
  walencja: "valencia",
  valencia: "valencia",
  vlc: "valencia",
  marrakesz: "marrakesh",
  marrakech: "marrakesh",
  rak: "marrakesh",
  malaga: "malaga",
  "malaga / costa del sol": "malaga",
  agp: "malaga",
  alicante: "alicante",
  "alicante / costa blanca": "alicante",
  alc: "alicante",
};

const FALLBACK_DESTINATION_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=480&q=75";

const WEATHER_OPTIONS: WeatherOption[] = [
  {
    emoji: "☀️",
    label: "Słonecznie",
    averageTemperature: 27,
    highestTemperature: 31,
    rainyDays: 0,
  },
  {
    emoji: "🌤️",
    label: "Lekko słonecznie",
    averageTemperature: 24,
    highestTemperature: 28,
    rainyDays: 1,
  },
  {
    emoji: "⛅",
    label: "Częściowe chmury",
    averageTemperature: 21,
    highestTemperature: 25,
    rainyDays: 2,
  },
  {
    emoji: "🌥️",
    label: "Pochmurno",
    averageTemperature: 19,
    highestTemperature: 23,
    rainyDays: 3,
  },
  {
    emoji: "🌧️",
    label: "Deszcz",
    averageTemperature: 17,
    highestTemperature: 21,
    rainyDays: 5,
  },
  {
    emoji: "⛈️",
    label: "Burzowo",
    averageTemperature: 25,
    highestTemperature: 29,
    rainyDays: 3,
  },
  {
    emoji: "🌬️",
    label: "Wietrznie",
    averageTemperature: 21,
    highestTemperature: 25,
    rainyDays: 1,
  },
  {
    emoji: "❄️",
    label: "Śnieg",
    averageTemperature: -2,
    highestTemperature: 1,
    rainyDays: 4,
  },
  {
    emoji: "🌡️",
    label: "Upalnie",
    averageTemperature: 33,
    highestTemperature: 38,
    rainyDays: 0,
  },
];

function ResultsSheet() {
  const { data: session } = authClient.useSession();
  const [rows, setRows] = useState<VoyaResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("Wczytuje lokalne wyniki...");
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [undoRow, setUndoRow] = useState<{ row: VoyaResultRow; index: number } | null>(null);
  const [interactions, setInteractions] =
    useState<Record<string, OfferInteractions>>(loadStoredInteractions);
  const [commentTarget, setCommentTarget] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [destinationMode, setDestinationMode] = useState<"any" | "specific">("any");
  const [specificPlaces, setSpecificPlaces] = useState<string[]>([]);
  const [filterSelected, setFilterSelected] = useState<string[]>([]);
  const [hotelStars, setHotelStars] = useState<number | null>(null);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [priceSort, setPriceSort] = useState<PriceSort>("none");
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [selectedMapRow, setSelectedMapRow] = useState<string | null>(null);
  const [statusPickerTarget, setStatusPickerTarget] = useState<string | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUser: InteractionUser = {
    id: session?.user.id ?? "local-user",
    name: session?.user.name ?? "Ty",
  };

  const loadRows = async () => {
    setError("");
    const result = await fetchVoyaOffers();
    setRows(result.rows);
    setMessage(result.payload.message || `Zrodlo: ${result.payload.source}`);
  };

  useEffect(() => {
    let active = true;
    fetchVoyaOffers()
      .then((result) => {
        if (!active) return;
        setRows(result.rows);
        setMessage(result.payload.message || `Zrodlo: ${result.payload.source}`);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Nie udalo sie wczytac wynikow.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(INTERACTIONS_STORAGE_KEY, JSON.stringify(interactions));
    } catch {
      // Reactions still work in memory when browser storage is unavailable.
    }
  }, [interactions]);

  const availableCountries = useMemo(
    () =>
      Array.from(new Set(rows.map(countryNameForRow).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pl"),
      ),
    [rows],
  );

  const displayRows = useMemo(() => {
    const next = rows.filter((row) => {
      const country = countryNameForRow(row);
      if (countryFilter.length > 0 && !countryFilter.includes(country)) return false;
      if (
        destinationMode === "specific" &&
        specificPlaces.length > 0 &&
        !specificPlaces.includes(country)
      ) {
        return false;
      }
      if (hotelStars !== null && row.hotelStars < hotelStars) return false;
      return filterSelected.every((id) => rowMatchesFilter(row, id));
    });

    if (priceSort === "none") return next;
    return [...next].sort((a, b) => (priceSort === "asc" ? a.price - b.price : b.price - a.price));
  }, [countryFilter, destinationMode, filterSelected, hotelStars, priceSort, rows, specificPlaces]);

  const visibleRows = displayRows.slice(0, visibleCount);
  const allRowsVisible = displayRows.length > 0 && visibleCount >= displayRows.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    countryFilter,
    destinationMode,
    displayRows.length,
    filterSelected,
    hotelStars,
    priceSort,
    specificPlaces,
  ]);

  useEffect(() => {
    setCountryFilter((current) => {
      const next = current.filter((country) => availableCountries.includes(country));
      return next.length === current.length ? current : next;
    });
  }, [availableCountries]);

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udalo sie odswiezyc wynikow.");
    } finally {
      setRefreshing(false);
    }
  };

  const updateStatus = (id: string, status: VoyaResultRow["status"]) =>
    setRows((items) => items.map((row) => (row.id === id ? { ...row, status } : row)));
  const toggleReaction = (id: string, reaction: "like" | "unlike") => {
    setInteractions((current) => {
      const existing = current[id] ?? { likes: [], unlikes: [], comments: [] };
      const target = reaction === "like" ? existing.likes : existing.unlikes;
      const isActive = target.some((user) => user.id === currentUser.id);
      const withoutCurrent = (users: InteractionUser[]) =>
        users.filter((user) => user.id !== currentUser.id);
      const nextTarget = isActive
        ? withoutCurrent(target)
        : [...withoutCurrent(target), currentUser];

      return {
        ...current,
        [id]: {
          ...existing,
          likes: reaction === "like" ? nextTarget : withoutCurrent(existing.likes),
          unlikes: reaction === "unlike" ? nextTarget : withoutCurrent(existing.unlikes),
        },
      };
    });
  };
  const cyclePriceSort = () =>
    setPriceSort((current) => (current === "none" ? "asc" : current === "asc" ? "desc" : "none"));
  const removeRow = (id: string) => {
    setRows((items) => {
      const index = items.findIndex((row) => row.id === id);
      if (index === -1) return items;
      const row = items[index];
      setUndoRow({ row, index });
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndoRow(null), 3000);
      return items.filter((item) => item.id !== id);
    });
  };
  const undoRemove = () => {
    if (!undoRow) return;
    setRows((items) => {
      const next = [...items];
      next.splice(Math.min(undoRow.index, next.length), 0, undoRow.row);
      return next;
    });
    setUndoRow(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };
  const copyShareLink = async () => {
    const link = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard && link)
      await navigator.clipboard.writeText(link).catch(() => undefined);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1800);
  };
  const openComment = (id: string) => {
    setCommentTarget(id);
    setCommentDraft("");
  };
  const closeComment = () => {
    setCommentTarget(null);
    setCommentDraft("");
  };
  const saveComment = () => {
    if (!commentTarget || !commentDraft.trim()) return;
    const targetId = commentTarget;
    const body = commentDraft.trim();
    setInteractions((current) => {
      const existing = current[targetId] ?? { likes: [], unlikes: [], comments: [] };
      return {
        ...current,
        [targetId]: {
          ...existing,
          comments: [
            ...existing.comments,
            { id: `${Date.now()}-${currentUser.id}`, author: currentUser, body },
          ],
        },
      };
    });
    setCommentDraft("");
  };
  return (
    <div
      className={`min-h-screen bg-background ${fullscreen ? "fixed inset-0 z-40 overflow-auto" : ""}`}
    >
      {!fullscreen && <TopBar />}

      {!fullscreen && (
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <Link
              to="/"
              className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Nowe wyszukiwanie
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✈️</span>
                  <h1 className="font-display text-2xl font-bold sm:text-3xl">Wyniki</h1>
                  <span className="rounded-full bg-brand-blue-soft px-3 py-1 text-xs font-semibold text-brand-blue-ink">
                    {displayRows.length} z {rows.length} ofert
                  </span>
                </div>
                <div className="mt-2 max-w-3xl text-sm text-muted-foreground">{message}</div>
                {error && (
                  <div className="mt-2 rounded-xl bg-brand-pink-soft px-3 py-2 text-xs text-foreground">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`sticky ${fullscreen ? "top-0" : "top-16"} z-20 border-b border-border bg-background/90 backdrop-blur`}
      >
        <div
          className={`mx-auto flex ${fullscreen ? "max-w-none" : "max-w-7xl"} flex-wrap items-center gap-2 px-4 py-3 sm:px-6`}
        >
          <button
            onClick={() => setFiltersOpen(true)}
            className={voyaButtonVariants({ variant: "outline", size: "xs" })}
          >
            <Filter className="h-3 w-3" /> Filtry
          </button>
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {displayRows.length} po filtrach
          </span>
          <div className="flex rounded-full border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                voyaButtonVariants({
                  variant: viewMode === "table" ? "primary" : "ghost",
                  size: "xs",
                }),
                viewMode === "table" ? "shadow-none" : "",
              )}
            >
              <Table2 className="h-3 w-3" />
              Tabela
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={cn(
                voyaButtonVariants({
                  variant: viewMode === "map" ? "primary" : "ghost",
                  size: "xs",
                }),
                viewMode === "map" ? "shadow-none" : "",
              )}
            >
              <Map className="h-3 w-3" />
              Mapa
            </button>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing || loading}
            className={voyaButtonVariants({ variant: "green", size: "xs" })}
          >
            <RefreshCw className={`h-3 w-3 ${refreshing || loading ? "animate-spin" : ""}`} />
            {loading ? "Wczytuje..." : "Odśwież ceny"}
          </button>
          <div className="ml-auto">
            <button
              onClick={copyShareLink}
              className={cn(voyaButtonVariants({ variant: "blue", size: "xs" }), "mr-2")}
            >
              <Share2 className="h-3 w-3" />
              {shareCopied ? "Link skopiowany" : "Udostępnij katalog"}
            </button>
            <button
              onClick={() => setFullscreen((value) => !value)}
              className={voyaButtonVariants({ variant: "outline", size: "xs" })}
              aria-label="Pelny ekran"
            >
              {fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              {fullscreen ? "Zwin" : "Pelny ekran"}
            </button>
          </div>
        </div>
      </div>

      <div className={`mx-auto ${fullscreen ? "max-w-none" : "max-w-7xl"} px-4 py-6 sm:px-6`}>
        {viewMode === "table" ? (
          <>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <Th>
                        <div className="flex items-center gap-2">
                          <span>Destynacja</span>
                          <CountryColumnFilter
                            countries={availableCountries}
                            selected={countryFilter}
                            onClear={() => setCountryFilter([])}
                            onToggle={(country) =>
                              setCountryFilter((current) =>
                                current.includes(country)
                                  ? current.filter((item) => item !== country)
                                  : [...current, country],
                              )
                            }
                          />
                        </div>
                      </Th>
                      <Th>Lot</Th>
                      <Th>Hotel</Th>
                      <Th>Pogoda</Th>
                      <Th>Liczba nocy</Th>
                      <Th className="text-right">
                        <button
                          type="button"
                          onClick={cyclePriceSort}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium hover:bg-background"
                        >
                          Cena / os.
                          <span className="text-[10px]">
                            {priceSort === "asc" ? "↑" : priceSort === "desc" ? "↓" : "↕"}
                          </span>
                        </button>
                      </Th>
                      <Th>Status</Th>
                      <Th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => {
                      const status = statusMeta[row.status];
                      const country = countryNameForRow(row);
                      const rowInteractions = interactions[row.id] ?? {
                        likes: [],
                        unlikes: [],
                        comments: [],
                      };
                      const likedByCurrentUser = rowInteractions.likes.some(
                        (user) => user.id === currentUser.id,
                      );
                      const unlikedByCurrentUser = rowInteractions.unlikes.some(
                        (user) => user.id === currentUser.id,
                      );
                      return (
                        <tr
                          key={row.id}
                          className={`border-b border-border last:border-0 transition-colors ${rowTone[row.status]}`}
                        >
                          <Td>
                            <Link
                              to="/offer/$id"
                              params={{ id: row.id }}
                              className="flex items-center gap-3"
                            >
                              <img
                                src={destinationImageForRow(row)}
                                alt={`Zdjęcie: ${row.destination}`}
                                className="h-12 w-16 shrink-0 rounded-xl object-cover shadow-soft"
                                loading="lazy"
                                onError={(event) => {
                                  if (event.currentTarget.dataset.fallbackApplied === "true")
                                    return;
                                  event.currentTarget.dataset.fallbackApplied = "true";
                                  event.currentTarget.src = FALLBACK_DESTINATION_IMAGE;
                                }}
                              />
                              <div>
                                <div className="font-semibold">{row.destination}</div>
                                <div className="text-xs text-muted-foreground">
                                  {country || row.destIata}
                                </div>
                              </div>
                            </Link>
                          </Td>
                          <Td className="text-xs text-muted-foreground">
                            <OfferLink href={row.flightLink} fallbackId={row.id}>
                              {row.flight}
                            </OfferLink>
                            <div>{row.dates}</div>
                          </Td>
                          <Td>
                            <OfferLink href={row.hotelLink} fallbackId={row.id} strong>
                              {row.hotel}
                            </OfferLink>
                            <div className="text-xs text-muted-foreground">
                              {row.hotelArea || row.propertyType}
                            </div>
                            {row.hotelStars > 0 && (
                              <div className="text-xs text-brand-yellow-ink">
                                {"★".repeat(row.hotelStars)}
                              </div>
                            )}
                          </Td>
                          <Td>
                            <WeatherSummary row={row} />
                          </Td>
                          <Td>{formatNights(row)}</Td>
                          <Td className="text-right">
                            <div className="font-display text-base font-semibold">
                              {formatPrice(row.price)}
                            </div>
                          </Td>
                          <Td>
                            <div className="flex min-w-[205px] flex-col items-start gap-1.5">
                              <div className="flex items-center gap-1">
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className="flex h-8 min-w-8 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground hover:bg-brand-blue-soft hover:text-brand-blue-ink"
                                        aria-label={`${rowInteractions.likes.length} lajków. Pokaż autorów`}
                                      >
                                        {rowInteractions.likes.length}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      align="start"
                                      className="w-56 rounded-2xl border border-border bg-card p-3 text-foreground shadow-pop"
                                    >
                                      <div className="font-semibold">Lajki</div>
                                      {rowInteractions.likes.length > 0 ? (
                                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                                          {rowInteractions.likes.map((user) => (
                                            <li key={user.id}>{user.name}</li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                          Nikt jeszcze nie dał lajka.
                                        </div>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <button
                                  type="button"
                                  onClick={() => toggleReaction(row.id, "like")}
                                  className={`flex h-8 items-center justify-center gap-1 rounded-full px-2 text-xs font-semibold ${likedByCurrentUser ? "bg-brand-green text-white" : "hover:bg-muted"}`}
                                  aria-label="Like"
                                  aria-pressed={likedByCurrentUser}
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" /> Like
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleReaction(row.id, "unlike")}
                                  className={`flex h-8 items-center justify-center gap-1 rounded-full px-2 text-xs font-semibold ${unlikedByCurrentUser ? "bg-brand-pink-soft text-foreground" : "hover:bg-muted"}`}
                                  aria-label="Unlike"
                                  aria-pressed={unlikedByCurrentUser}
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" /> Unlike
                                </button>
                                <Popover
                                  open={commentTarget === row.id}
                                  onOpenChange={(open) =>
                                    open ? openComment(row.id) : closeComment()
                                  }
                                >
                                  <PopoverTrigger asChild>
                                    <button
                                      className="flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-2 text-sm hover:bg-muted"
                                      aria-label="Komentarze"
                                    >
                                      <MessageCircle className="h-3.5 w-3.5" />
                                      {rowInteractions.comments.length || ""}
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    side="left"
                                    align="center"
                                    className="w-80 rounded-2xl border-border bg-card p-4 shadow-pop"
                                  >
                                    <CommentEditor
                                      comments={rowInteractions.comments}
                                      draft={commentDraft}
                                      onCancel={closeComment}
                                      onChange={setCommentDraft}
                                      onSave={saveComment}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <Popover
                                open={statusPickerTarget === row.id}
                                onOpenChange={(open) => setStatusPickerTarget(open ? row.id : null)}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.tone}`}
                                  >
                                    {status.label}
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  side="left"
                                  align="center"
                                  className="w-52 rounded-2xl border-border bg-card p-2 shadow-pop"
                                >
                                  <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Status
                                  </div>
                                  {STATUS_OPTIONS.map((option) => {
                                    const optionMeta = statusMeta[option];
                                    const active = row.status === option;
                                    return (
                                      <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                          updateStatus(row.id, option);
                                          setStatusPickerTarget(null);
                                        }}
                                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                                      >
                                        <span>{optionMeta.label}</span>
                                        {active && <Check className="h-4 w-4 text-brand-blue" />}
                                      </button>
                                    );
                                  })}
                                </PopoverContent>
                              </Popover>
                            </div>
                          </Td>
                          <Td>
                            <button
                              onClick={() => removeRow(row.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-brand-pink-soft hover:text-brand-pink"
                              aria-label="Usun wiersz"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </Td>
                        </tr>
                      );
                    })}
                    {!loading && displayRows.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                          {rows.length === 0
                            ? "Brak ofert w `output/offers.json`."
                            : "Brak ofert pasujących do wybranych filtrów."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {displayRows.length > PAGE_SIZE && (
              <div className="mt-4 rounded-2xl border border-border bg-card p-3">
                <div className="text-sm text-muted-foreground">
                  Pokazujesz {Math.min(visibleCount, displayRows.length)} z {displayRows.length}{" "}
                  ofert
                </div>
                <div className="mt-3">
                  {!allRowsVisible ? (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((current) =>
                          Math.min(displayRows.length, current + PAGE_SIZE),
                        )
                      }
                      className="w-full rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-pop"
                    >
                      Załaduj więcej ofert
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setMessage("Szukam podobnych, mniej dopasowanych ofert w prototypie.")
                      }
                      className="w-full rounded-full border border-brand-blue/40 bg-brand-blue-soft px-4 py-2.5 text-sm font-semibold text-brand-blue-ink hover:brightness-105"
                    >
                      Znajdź podobne oferty
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <FlightMap rows={displayRows} selectedId={selectedMapRow} onSelect={setSelectedMapRow} />
        )}
      </div>
      {undoRow && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-pop animate-in slide-in-from-left-4 fade-in duration-200">
          <span>Usunięto ofertę</span>
          <button
            type="button"
            onClick={undoRemove}
            className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background"
          >
            Cofnij
          </button>
        </div>
      )}
      {filtersOpen && (
        <SheetFiltersModal
          destinationMode={destinationMode}
          specificPlaces={specificPlaces}
          selected={filterSelected}
          hotelStars={hotelStars}
          onClose={() => setFiltersOpen(false)}
          onSave={(next) => {
            setDestinationMode(next.destinationMode);
            setSpecificPlaces(next.specificPlaces);
            setFilterSelected(next.selected);
            setHotelStars(next.hotelStars);
            setFiltersOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function CountryColumnFilter({
  countries,
  selected,
  onClear,
  onToggle,
}: {
  countries: string[];
  selected: string[];
  onClear: () => void;
  onToggle: (country: string) => void;
}) {
  const triggerLabel =
    selected.length === 0
      ? "Kraj"
      : selected.length === 1
        ? selected[0]
        : `Kraje: ${selected.length}`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold normal-case",
            selected.length === 0
              ? "bg-background text-muted-foreground"
              : "bg-brand-blue-soft text-brand-blue-ink",
          )}
        >
          {triggerLabel}
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 rounded-2xl border-border bg-card p-2 text-sm shadow-pop"
      >
        <button
          type="button"
          onClick={onClear}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted"
        >
          <span>Wszystkie kraje</span>
          {selected.length === 0 && <Check className="h-4 w-4 text-brand-blue" />}
        </button>
        {countries.map((country) => (
          <button
            key={country}
            type="button"
            onClick={() => onToggle(country)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted"
          >
            <span>{country}</span>
            {selected.includes(country) && <Check className="h-4 w-4 text-brand-blue" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function CommentEditor({
  comments,
  draft,
  onCancel,
  onChange,
  onSave,
}: {
  comments: OfferComment[];
  draft: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-base font-semibold">Komentarze</div>
          <div className="text-xs text-muted-foreground">Dodaj notatkę do oferty.</div>
        </div>
        <button type="button" onClick={onCancel} className="rounded-full p-1.5 hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      {comments.length > 0 && (
        <div className="mb-3 max-h-40 space-y-2 overflow-y-auto rounded-2xl bg-muted/60 p-3">
          {comments.map((comment) => (
            <div key={comment.id} className="text-xs">
              <div className="font-semibold text-foreground">{comment.author.name}</div>
              <div className="mt-0.5 whitespace-pre-wrap text-muted-foreground">{comment.body}</div>
            </div>
          ))}
        </div>
      )}
      <textarea
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        className="h-24 w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-brand-blue"
        placeholder="np. dobry hotel, ale lot za wcześnie"
      />
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-3 py-1.5 text-sm font-medium"
        >
          Anuluj
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!draft.trim()}
          className="rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          Zapisz
        </button>
      </div>
    </div>
  );
}

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function destinationImageForRow(row: VoyaResultRow) {
  for (const identifier of [row.destIata, row.destination]) {
    const key = normalizeText(identifier || "")
      .replace(/[–—]/gu, "-")
      .replace(/\s+/gu, " ")
      .trim();
    const canonicalName = DESTINATION_IMAGE_ALIASES[key];
    if (canonicalName) return DESTINATION_IMAGE_URLS[canonicalName];
  }
  return FALLBACK_DESTINATION_IMAGE;
}

function countryNameForRow(row: VoyaResultRow) {
  if (row.country?.trim()) {
    const country = row.country.trim();
    const normalized = normalizeText(country);
    const aliases: Record<string, string> = {
      es: "Hiszpania",
      spain: "Hiszpania",
      hiszpania: "Hiszpania",
      pt: "Portugalia",
      portugal: "Portugalia",
      portugalia: "Portugalia",
      gr: "Grecja",
      greece: "Grecja",
      grecja: "Grecja",
      hr: "Chorwacja",
      croatia: "Chorwacja",
      chorwacja: "Chorwacja",
      it: "Włochy",
      italy: "Włochy",
      wlochy: "Włochy",
      ma: "Maroko",
      morocco: "Maroko",
      maroko: "Maroko",
    };
    return aliases[normalized] ?? country;
  }
  const destination = normalizeText(row.destination);
  if (destination.includes("palma") || destination.includes("walencja")) return "Hiszpania";
  if (destination.includes("lizbona")) return "Portugalia";
  if (destination.includes("split")) return "Chorwacja";
  if (destination.includes("kreta") || destination.includes("chania")) return "Grecja";
  if (destination.includes("marrakesz")) return "Maroko";
  return "";
}

function rowMatchesFilter(row: VoyaResultRow, id: string) {
  const vibe = VIBES.find((item) => item.id === id);
  const text = normalizeText(
    [
      row.destination,
      row.country,
      row.hotel,
      row.hotelArea,
      row.propertyType,
      row.flight,
      row.vibes.join(" "),
      row.weather,
    ].join(" "),
  );

  if (id === "direct") return text.includes("direct") || text.includes("bez przesiad");
  if (id === "onestop") return text.includes("1 stop") || text.includes("przesiad");
  if (id === "shortflight") {
    const match = row.flight.match(/(\d+(?:[,.]\d+)?)\s*h/i);
    return match ? Number(match[1].replace(",", ".")) < 4 : true;
  }
  if (id === "pool") return row.pool === "yes" || text.includes("pool") || text.includes("basen");
  if (id === "hotel") return text.includes("hotel");
  if (id === "apartment") return text.includes("apart") || text.includes("mieszkan");
  if (id === "resort") return text.includes("resort");
  if (id === "hostel") return text.includes("hostel");
  if (id === "bnb") return text.includes("b&b") || text.includes("pensjonat");
  if (id === "boutique") return text.includes("butik");
  if (id === "seaview") {
    return (
      row.vibes.includes("🌊") ||
      row.vibes.includes("🏖️") ||
      text.includes("plaz") ||
      text.includes("near beach") ||
      text.includes("beachfront")
    );
  }
  if (id === "safe") {
    return row.vibes.includes("🛡️") || text.includes("bezpiecz") || text.includes("safe");
  }

  if (!vibe) return true;
  const normalizedLabel = normalizeText(vibe.label);
  return row.vibes.includes(vibe.emoji) || text.includes(normalizedLabel);
}

function formatPrice(value: number) {
  if (!value) return "-";
  return `${Math.round(value).toLocaleString("pl-PL")} zł`;
}

function formatNights(row: VoyaResultRow) {
  const nights =
    row.nights || (row.days > 0 ? Math.max(1, row.days - 1) : row.source === "demo" ? 7 : 0);
  if (!nights) return "-";
  const lastTwoDigits = nights % 100;
  const lastDigit = nights % 10;
  const suffix =
    nights === 1
      ? "noc"
      : lastTwoDigits >= 12 && lastTwoDigits <= 14
        ? "nocy"
        : lastDigit >= 2 && lastDigit <= 4
          ? "noce"
          : "nocy";
  return `${nights} ${suffix}`;
}

function OfferLink({
  href,
  fallbackId,
  strong,
  children,
}: {
  href?: string;
  fallbackId: string;
  strong?: boolean;
  children: ReactNode;
}) {
  const className = `${strong ? "font-medium text-foreground" : "font-semibold text-foreground"} hover:text-brand-blue`;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to="/offer/$id" params={{ id: fallbackId }} className={className}>
      {children}
    </Link>
  );
}

function WeatherSummary({ row }: { row: VoyaResultRow }) {
  const weather = getWeatherForRow(row);
  const averageTemperature = `${weather.averageTemperature}°C`;
  const highestTemperature = `${weather.highestTemperature}°C`;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex h-9 min-w-[92px] items-center justify-center gap-1.5 rounded-full bg-muted px-2 text-sm font-semibold transition-colors hover:bg-brand-yellow-soft"
            aria-label={`Pogoda: ${weather.label}. Dni deszczowe: ${weather.rainyDays}. Średnia temperatura: ${averageTemperature}. Najwyższa temperatura: ${highestTemperature}.`}
          >
            <span className="text-xl">{weather.emoji}</span>
            <span>{averageTemperature}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="w-64 rounded-2xl border border-border bg-card p-3 text-foreground shadow-pop"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{weather.emoji}</span>
            <span className="font-semibold">{weather.label}</span>
          </div>
          <dl className="space-y-1.5 text-xs">
            <WeatherDetail label="Dni deszczowe" value={`${weather.rainyDays}`} />
            <WeatherDetail label="Średnia temperatura" value={averageTemperature} />
            <WeatherDetail label="Najwyższa temperatura" value={highestTemperature} />
          </dl>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function WeatherDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function getWeatherForRow(row: VoyaResultRow) {
  const seed = `${row.destination}-${row.dates}-${row.id}`;
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const fallback = WEATHER_OPTIONS[hash % WEATHER_OPTIONS.length];
  const parsedTemperature = row.weather.match(/-?\d+(?:[.,]\d+)?/u)?.[0]?.replace(",", ".");
  const averageTemperature = parsedTemperature
    ? Math.round(Number(parsedTemperature))
    : fallback.averageTemperature;
  const description = normalizeText(row.weather);
  const tripDays = row.days || (row.nights > 0 ? row.nights + 1 : 0);
  const rainyDays = description.match(/burz|storm|thunder/u)
    ? 3
    : description.match(/deszcz|rain|shower/u)
      ? 4
      : description.match(/snieg|snow/u)
        ? 4
        : description.match(/chmur|cloud/u)
          ? 2
          : parsedTemperature
            ? 0
            : fallback.rainyDays;
  const label = description.match(/burz|storm|thunder/u)
    ? "Burzowo"
    : description.match(/deszcz|rain|shower/u)
      ? "Deszcz"
      : description.match(/snieg|snow/u)
        ? "Śnieg"
        : description.match(/chmur|cloud/u)
          ? "Pochmurno"
          : description.match(/slon|sun|clear/u)
            ? "Słonecznie"
            : fallback.label;

  return {
    ...fallback,
    emoji: row.weatherEmoji || fallback.emoji,
    label,
    averageTemperature,
    highestTemperature: parsedTemperature
      ? averageTemperature + (averageTemperature >= 30 ? 5 : 4)
      : fallback.highestTemperature,
    rainyDays: tripDays > 0 ? Math.min(rainyDays, tripDays) : rainyDays,
  };
}

function FlightMap({
  rows,
  selectedId,
  onSelect,
}: {
  rows: VoyaResultRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const activeId = selectedId ?? rows[0]?.id ?? null;
  const selected = rows.find((row) => row.id === activeId) ?? rows[0];

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
        Brak ofert do pokazania na mapie.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-semibold">
              <Map className="h-5 w-5 text-brand-blue" />
              Mapa lotów
            </div>
            <div className="text-xs text-muted-foreground">
              Prototyp widoku mapy. Przewijaj mapę i klikaj punkty ofert.
            </div>
          </div>
          <div className="rounded-full bg-brand-blue-soft px-3 py-1 text-xs font-semibold text-brand-blue-ink">
            {rows.length} zaznaczonych lotów
          </div>
        </div>
        <div className="overflow-auto border-t border-border bg-brand-blue-soft/20">
          <div className="relative h-[540px] min-w-[1120px] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.95),transparent_28%),linear-gradient(135deg,rgba(218,242,255,0.95),rgba(235,249,232,0.95)_45%,rgba(255,246,208,0.95))]">
            <MapBlob className="left-[4%] top-[18%] h-52 w-80 rotate-[-8deg]" />
            <MapBlob className="left-[36%] top-[23%] h-60 w-[28rem] rotate-[7deg]" />
            <MapBlob className="left-[62%] top-[54%] h-44 w-72 rotate-[-12deg]" />
            <MapLabel left={10} top={22} label="Atlantyk" />
            <MapLabel left={42} top={27} label="Europa" />
            <MapLabel left={66} top={70} label="Morze Śródziemne" />
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-foreground px-3 py-2 text-xs font-bold text-background shadow-pop"
              style={{ left: `${ORIGIN_POINT.x}%`, top: `${ORIGIN_POINT.y}%` }}
            >
              {ORIGIN_POINT.airport}
            </div>
            {rows.map((row, index) => {
              const point = getMapPoint(row, index);
              const active = row.id === activeId;
              return (
                <div key={row.id}>
                  <FlightLine point={point} active={active} />
                  <button
                    type="button"
                    onClick={() => onSelect(row.id)}
                    className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 text-left text-xs shadow-pop transition-transform hover:scale-105 ${
                      active
                        ? "border-brand-blue bg-foreground text-background"
                        : "border-border bg-card text-foreground"
                    }`}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      <CountryFlag
                        flag={row.flag}
                        label={row.country || row.destination}
                        className="h-3.5 w-5"
                      />
                      <span>{point.airport}</span>
                    </div>
                    <div className="whitespace-nowrap text-[10px] opacity-80">
                      {row.destination} · {formatPrice(row.price)}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <PlaneTakeoff className="h-4 w-4 text-brand-green" />
          <div className="font-display text-lg font-semibold">Loty w katalogu</div>
        </div>
        {selected && (
          <div className="mb-4 rounded-2xl bg-brand-yellow-soft/55 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-yellow-ink">
              Zaznaczona oferta
            </div>
            <div className="mt-1 font-display text-lg font-semibold">
              <span className="inline-flex items-center gap-2">
                <CountryFlag
                  flag={selected.flag}
                  label={selected.country || selected.destination}
                  className="h-4 w-6"
                />
                {selected.destination}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{selected.dates}</div>
            <div className="mt-3 space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Lot: </span>
                <OfferLink href={selected.flightLink} fallbackId={selected.id}>
                  {selected.flight}
                </OfferLink>
              </div>
              <div>
                <span className="text-muted-foreground">Hotel: </span>
                <OfferLink href={selected.hotelLink} fallbackId={selected.id} strong>
                  {selected.hotel}
                </OfferLink>
              </div>
            </div>
            <div className="mt-3 font-display text-xl font-bold">{formatPrice(selected.price)}</div>
          </div>
        )}
        <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
          {rows.map((row, index) => {
            const point = getMapPoint(row, index);
            const active = row.id === activeId;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelect(row.id)}
                className={`w-full rounded-2xl border p-3 text-left text-sm transition-colors ${
                  active
                    ? "border-brand-blue bg-brand-blue-soft"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">
                    <span className="inline-flex items-center gap-2">
                      <CountryFlag
                        flag={row.flag}
                        label={row.country || row.destination}
                        className="h-4 w-6"
                      />
                      {row.destination}
                    </span>
                  </span>
                  <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold">
                    {point.airport}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {row.flight} · {formatPrice(row.price)}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function getMapPoint(row: VoyaResultRow, index: number): MapPoint {
  if (MAP_POINTS[row.destination]) return MAP_POINTS[row.destination];
  return {
    x: 24 + ((index * 17) % 58),
    y: 43 + ((index * 13) % 40),
    airport: row.destIata || row.destination.slice(0, 3).toUpperCase(),
  };
}

function FlightLine({ point, active }: { point: MapPoint; active: boolean }) {
  const dx = point.x - ORIGIN_POINT.x;
  const dy = point.y - ORIGIN_POINT.y;
  const style: CSSProperties = {
    left: `${ORIGIN_POINT.x}%`,
    top: `${ORIGIN_POINT.y}%`,
    width: `${Math.sqrt(dx * dx + dy * dy)}%`,
    transform: `rotate(${Math.atan2(dy, dx) * (180 / Math.PI)}deg)`,
  };
  return (
    <span
      className={`absolute z-10 h-0.5 origin-left rounded-full ${
        active ? "bg-brand-blue opacity-90" : "bg-foreground/20 opacity-70"
      }`}
      style={style}
    />
  );
}

function MapBlob({ className }: { className: string }) {
  return (
    <span
      className={`absolute rounded-[45%] bg-background/75 shadow-soft ring-1 ring-border/40 ${className}`}
    />
  );
}

function MapLabel({ left, top, label }: { left: number; top: number; label: string }) {
  return (
    <span
      className="absolute rounded-full bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      {label}
    </span>
  );
}

function SheetFiltersModal({
  destinationMode,
  specificPlaces,
  selected,
  hotelStars,
  onClose,
  onSave,
}: {
  destinationMode: "any" | "specific";
  specificPlaces: string[];
  selected: string[];
  hotelStars: number | null;
  onClose: () => void;
  onSave: (value: {
    destinationMode: "any" | "specific";
    specificPlaces: string[];
    selected: string[];
    hotelStars: number | null;
  }) => void;
}) {
  const [nextDestinationMode, setNextDestinationMode] = useState(destinationMode);
  const [nextPlaces, setNextPlaces] = useState(specificPlaces);
  const [nextSelected, setNextSelected] = useState(selected);
  const [nextStars, setNextStars] = useState(hotelStars);
  const [activeSection, setActiveSection] = useState<"hotel" | "destination">("hotel");
  const allVibes = VIBES;
  const destinationPills = allVibes.filter(
    (vibe) => vibe.category === "destination" || vibe.category === "mood",
  );
  const climatePills = allVibes.filter((vibe) => vibe.category === "climate");
  const stayPills = allVibes.filter((vibe) => vibe.category === "stay");
  const lodging = stayPills.filter((vibe) => LODGING_TYPES.includes(vibe.id));
  const amenities = stayPills.filter((vibe) => !LODGING_TYPES.includes(vibe.id));
  const toggleLocal = (id: string) =>
    setNextSelected((current) => {
      const exclusiveGroup = ["direct", "onestop"].includes(id) ? ["direct", "onestop"] : null;
      if (exclusiveGroup) {
        return current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current.filter((item) => !exclusiveGroup.includes(item)), id];
      }
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    });
  const togglePlace = (place: string) =>
    setNextPlaces((current) =>
      current.includes(place) ? current.filter((item) => item !== place) : [...current, place],
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 pt-16 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-pop"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-xl font-semibold">Filtry katalogu</div>
            <div className="text-xs text-muted-foreground">
              Możesz zmienić miejsce, charakter wyjazdu i filtry hotelu.
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex gap-2 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveSection("hotel")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
              activeSection === "hotel" ? "bg-background shadow-pop" : "text-muted-foreground"
            }`}
          >
            Hotel i udogodnienia
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("destination")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
              activeSection === "destination" ? "bg-background shadow-pop" : "text-muted-foreground"
            }`}
          >
            Kraj i klimat
          </button>
        </div>

        {activeSection === "hotel" ? (
          <div className="space-y-4 rounded-2xl bg-brand-green-soft/30 p-4">
            <FilterPillGroup
              title="Zakwaterowanie"
              pills={lodging}
              selected={nextSelected}
              toggle={toggleLocal}
            />
            <FilterPillGroup
              title="Udogodnienia"
              pills={amenities}
              selected={nextSelected}
              toggle={toggleLocal}
            />
            <StarThresholdPicker value={nextStars} onChange={setNextStars} />
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
            <div className="flex gap-2 rounded-full bg-muted p-1">
              <button
                type="button"
                onClick={() => setNextDestinationMode("any")}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
                  nextDestinationMode === "any"
                    ? "bg-background shadow-pop"
                    : "text-muted-foreground"
                }`}
              >
                Dowolne miejsce
              </button>
              <button
                type="button"
                onClick={() => setNextDestinationMode("specific")}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
                  nextDestinationMode === "specific"
                    ? "bg-background shadow-pop"
                    : "text-muted-foreground"
                }`}
              >
                Konkretne miejsce
              </button>
            </div>

            {nextDestinationMode === "any" ? (
              <div className="space-y-4">
                <FilterPillGroup
                  title="Charakter miejsca"
                  pills={destinationPills}
                  selected={nextSelected}
                  toggle={toggleLocal}
                />
                <FilterPillGroup
                  title="Pogoda i klimat"
                  pills={climatePills}
                  selected={nextSelected}
                  toggle={toggleLocal}
                />
              </div>
            ) : (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Zmień miejsce
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: "ES", label: "Hiszpania" },
                    { code: "PT", label: "Portugalia" },
                    { code: "GR", label: "Grecja" },
                    { code: "HR", label: "Chorwacja" },
                    { code: "IT", label: "Włochy" },
                  ].map((place) => (
                    <button
                      key={place.code}
                      type="button"
                      onClick={() => togglePlace(place.label)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        nextPlaces.includes(place.label)
                          ? "bg-brand-blue text-white shadow-pop"
                          : "bg-muted hover:bg-brand-blue-soft"
                      }`}
                    >
                      <CountryFlag code={place.code} label={place.label} />
                      {place.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                destinationMode: nextDestinationMode,
                specificPlaces: nextPlaces,
                selected: nextSelected,
                hotelStars: nextStars,
              })
            }
            className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterPillGroup({
  title,
  pills,
  selected,
  toggle,
}: {
  title: string;
  pills: Vibe[];
  selected: string[];
  toggle: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {pills.map((pill) => (
          <VibePill
            key={pill.id}
            emoji={pill.emoji}
            label={pill.label}
            tone={pill.tone}
            active={selected.includes(pill.id)}
            onClick={() => toggle(pill.id)}
          />
        ))}
      </div>
    </div>
  );
}
