import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Filter,
  Map,
  Maximize2,
  Minimize2,
  PlaneTakeoff,
  RefreshCw,
  Share2,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { TopBar } from "@/components/voya/TopBar";
import { CountryFlag } from "@/components/voya/CountryFlag";
import { VibePill } from "@/components/voya/VibePill";
import { VIBES, type Vibe } from "@/lib/voya-data";
import { fetchVoyaOffers, type VoyaResultRow } from "@/lib/voya-search";

export const Route = createFileRoute("/results/$id")({
  component: ResultsSheet,
  head: () => ({
    meta: [
      { title: "Wyniki · Voya" },
      { name: "description", content: "MVP arkusza wynikow z VoyaSearchEngine." },
    ],
  }),
});

const statusMeta = {
  loved: { label: "Bierzemy", tone: "bg-brand-green-soft text-brand-green-ink" },
  maybe: { label: "Moze", tone: "bg-brand-yellow-soft text-brand-yellow-ink" },
  pending: { label: "Do sprawdzenia", tone: "bg-muted text-muted-foreground" },
  no: { label: "Odpada", tone: "bg-brand-pink-soft text-foreground" },
} as const;

const rowTone: Record<VoyaResultRow["status"], string> = {
  loved: "bg-brand-green-soft/40 hover:bg-brand-green-soft/60",
  maybe: "bg-brand-yellow-soft/40 hover:bg-brand-yellow-soft/60",
  pending: "hover:bg-muted/40",
  no: "line-through opacity-50 hover:opacity-70",
};

const PAGE_SIZE = 5;
const STATUS_FLOW: VoyaResultRow["status"][] = ["pending", "loved", "maybe", "no"];
const LODGING_TYPES = [
  "allinclusive",
  "hotel",
  "apartment",
  "resort",
  "hostel",
  "glamping",
  "bnb",
  "boutique",
];

type MapPoint = { x: number; y: number; airport: string };
type WeatherOption = {
  emoji: string;
  label: string;
  detail: string;
};

const ORIGIN_POINT: MapPoint = { x: 48, y: 35, airport: "WAW" };
const MAP_POINTS: Record<string, MapPoint> = {
  Lizbona: { x: 18, y: 63, airport: "LIS" },
  Split: { x: 58, y: 53, airport: "SPU" },
  "Palma de Mallorca": { x: 39, y: 62, airport: "PMI" },
  "Kreta — Chania": { x: 70, y: 73, airport: "CHQ" },
  Walencja: { x: 35, y: 63, airport: "VLC" },
  Marrakesz: { x: 24, y: 82, airport: "RAK" },
};

const WEATHER_OPTIONS: WeatherOption[] = [
  { emoji: "☀️", label: "Słonecznie", detail: "28°C · bez opadów · UV wysokie" },
  { emoji: "🌤️", label: "Lekko słonecznie", detail: "24°C · małe zachmurzenie · dobry komfort" },
  { emoji: "⛅", label: "Częściowe chmury", detail: "22°C · przejaśnienia · wiatr umiarkowany" },
  { emoji: "🌥️", label: "Pochmurno", detail: "19°C · dużo chmur · niskie UV" },
  { emoji: "🌧️", label: "Deszcz", detail: "17°C · przelotne opady · parasol wskazany" },
  { emoji: "⛈️", label: "Burzowo", detail: "26°C · możliwe burze po południu" },
  { emoji: "🌬️", label: "Wietrznie", detail: "21°C · wiatr 32 km/h · dobre na sporty wodne" },
  { emoji: "❄️", label: "Śnieg", detail: "-2°C · opady śniegu · warunki zimowe" },
  { emoji: "🌡️", label: "Upalnie", detail: "34°C · bardzo ciepło · szukaj cienia" },
];

function ResultsSheet() {
  const [rows, setRows] = useState<VoyaResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("Wczytuje lokalne wyniki...");
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [undoRow, setUndoRow] = useState<{ row: VoyaResultRow; index: number } | null>(null);
  const [comments, setComments] = useState<Record<string, number>>({});
  const [commentTarget, setCommentTarget] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [destinationMode, setDestinationMode] = useState<"any" | "specific">("any");
  const [specificPlaces, setSpecificPlaces] = useState<string[]>([]);
  const [filterSelected, setFilterSelected] = useState<string[]>(["direct", "pool"]);
  const [hotelStars, setHotelStars] = useState<number | null>(null);
  const [reviewScore, setReviewScore] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [selectedMapRow, setSelectedMapRow] = useState<string | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const visibleRows = rows.slice(0, visibleCount);
  const allRowsVisible = rows.length > 0 && visibleCount >= rows.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [rows.length]);

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
  const cycleStatus = (id: string, status: VoyaResultRow["status"]) => {
    const index = STATUS_FLOW.indexOf(status);
    updateStatus(id, STATUS_FLOW[(index + 1) % STATUS_FLOW.length]);
  };
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
  const saveComment = () => {
    if (!commentTarget || !commentDraft.trim()) return;
    setComments((current) => ({ ...current, [commentTarget]: (current[commentTarget] || 0) + 1 }));
    setCommentTarget(null);
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
                    {rows.length} ofert
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
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <Filter className="h-3 w-3" /> Filtry
          </button>
          <div className="flex rounded-full border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                viewMode === "table" ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              <Table2 className="h-3 w-3" />
              Tabela
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                viewMode === "map" ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              <Map className="h-3 w-3" />
              Mapa
            </button>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/40 bg-brand-green-soft px-3 py-1.5 text-xs font-semibold text-brand-green-ink transition-colors hover:brightness-105 disabled:opacity-70"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing || loading ? "animate-spin" : ""}`} />
            {loading ? "Wczytuje..." : "Odśwież ceny"}
          </button>
          <div className="ml-auto">
            <button
              onClick={copyShareLink}
              className="mr-2 inline-flex items-center gap-1.5 rounded-full border border-brand-blue/40 bg-brand-blue-soft px-3 py-1.5 text-xs font-semibold text-brand-blue-ink hover:brightness-105"
            >
              <Share2 className="h-3 w-3" />
              {shareCopied ? "Link skopiowany" : "Share arkusz"}
            </button>
            <button
              onClick={() => setFullscreen((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
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
                <table className="w-full min-w-[1140px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <Th>Destynacja</Th>
                      <Th>Lot</Th>
                      <Th>Hotel</Th>
                      <Th>Pogoda</Th>
                      <Th>Pasuje</Th>
                      <Th>Dni</Th>
                      <Th className="text-right">Cena / os.</Th>
                      <Th>Status</Th>
                      <Th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => {
                      const status = statusMeta[row.status];
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
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl">
                                <CountryFlag
                                  flag={row.flag}
                                  label={row.country || row.destination}
                                  className="h-6 w-8"
                                />
                              </span>
                              <div>
                                <div className="font-semibold">{row.destination}</div>
                                <div className="text-xs text-muted-foreground">
                                  {row.country || row.destIata}
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
                          <Td>
                            <MatchSummary row={row} />
                          </Td>
                          <Td>{formatDays(row)}</Td>
                          <Td className="text-right">
                            <div className="font-display text-base font-semibold">
                              {formatPrice(row.price)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              lot {formatPrice(row.flightPrice)} + hotel{" "}
                              {formatPrice(row.hotelPrice)}
                            </div>
                          </Td>
                          <Td>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateStatus(row.id, "loved")}
                                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${row.status === "loved" ? "bg-brand-green text-white" : "hover:bg-muted"}`}
                                  aria-label="Lubię"
                                >
                                  👍
                                </button>
                                <button
                                  onClick={() => openComment(row.id)}
                                  className="flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm hover:bg-muted"
                                  aria-label="Komentarz"
                                >
                                  💬{comments[row.id] ? ` ${comments[row.id]}` : ""}
                                </button>
                                <button
                                  onClick={() => updateStatus(row.id, "no")}
                                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${row.status === "no" ? "bg-brand-pink-soft" : "hover:bg-muted"}`}
                                  aria-label="Nie lubię"
                                >
                                  👎
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => cycleStatus(row.id, row.status)}
                                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.tone}`}
                              >
                                {status.label}
                              </button>
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
                    {!loading && rows.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-sm text-muted-foreground">
                          Brak ofert w `output/offers.json`.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {rows.length > PAGE_SIZE && (
              <div className="mt-4 rounded-2xl border border-border bg-card p-3">
                <div className="text-sm text-muted-foreground">
                  Pokazujesz {Math.min(visibleCount, rows.length)} z {rows.length} ofert
                </div>
                <div className="mt-3">
                  {!allRowsVisible ? (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((current) => Math.min(rows.length, current + PAGE_SIZE))
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
          <FlightMap rows={rows} selectedId={selectedMapRow} onSelect={setSelectedMapRow} />
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
          reviewScore={reviewScore}
          onClose={() => setFiltersOpen(false)}
          onSave={(next) => {
            setDestinationMode(next.destinationMode);
            setSpecificPlaces(next.specificPlaces);
            setFilterSelected(next.selected);
            setHotelStars(next.hotelStars);
            setReviewScore(next.reviewScore);
            setFiltersOpen(false);
          }}
        />
      )}
      {commentTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onMouseDown={() => setCommentTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-pop"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-lg font-semibold">Komentarz</div>
                <div className="text-xs text-muted-foreground">Dodaj notatkę do oferty.</div>
              </div>
              <button
                onClick={() => setCommentTarget(null)}
                className="rounded-full p-2 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              className="h-24 w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-brand-blue"
              placeholder="np. dobry hotel, ale lot za wcześnie"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCommentTarget(null)}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium"
              >
                Anuluj
              </button>
              <button
                onClick={saveComment}
                className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
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

function formatPrice(value: number) {
  if (!value) return "-";
  return `${Math.round(value).toLocaleString("pl-PL")} zl`;
}

function formatDays(row: VoyaResultRow) {
  const days = row.days || row.nights || (row.source === "demo" ? 7 : 0);
  return days ? `${days} dni` : "-";
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
  return (
    <div className="group relative inline-flex" title={`${weather.label}: ${weather.detail}`}>
      <button
        type="button"
        className="flex h-9 min-w-9 items-center justify-center rounded-full bg-muted px-2 text-xl transition-colors hover:bg-brand-yellow-soft"
        aria-label={`Pogoda: ${weather.label}. ${weather.detail}`}
      >
        {weather.emoji}
      </button>
      <div className="pointer-events-none absolute left-0 top-11 z-40 w-56 rounded-2xl border border-border bg-card p-3 text-left text-xs opacity-0 shadow-pop transition-opacity group-hover:opacity-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">{weather.emoji}</span>
          <div className="font-semibold text-foreground">{weather.label}</div>
        </div>
        <div className="mt-1 text-muted-foreground">{weather.detail}</div>
      </div>
    </div>
  );
}

function getWeatherForRow(row: VoyaResultRow) {
  const seed = `${row.destination}-${row.dates}-${row.id}`;
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return WEATHER_OPTIONS[hash % WEATHER_OPTIONS.length];
}

function MatchSummary({ row }: { row: VoyaResultRow }) {
  const emojis = [
    row.pool === "yes" ? "🏊" : null,
    row.hotelStars >= 4 ? "⭐" : null,
    row.price && row.price <= 2200 ? "💸" : null,
    row.vibes.slice(0, 2),
  ]
    .flat()
    .filter(Boolean)
    .slice(0, 4);
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-muted px-2 py-1 text-sm">{emojis.join(" ") || "✨"}</span>
      <span className="text-xs font-semibold text-muted-foreground">{row.match}%</span>
    </div>
  );
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
          <div className="font-display text-lg font-semibold">Loty w arkuszu</div>
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

function NumberThresholdMini({
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
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-3 py-2">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        <div className="text-sm font-semibold">
          {value === null ? "Dowolnie" : `${value}${suffix}`}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(value === null || value <= min ? null : current - 1)}
          disabled={value === null}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border disabled:opacity-35"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value === null ? min : current + 1))}
          disabled={value !== null && value >= max}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border disabled:opacity-35"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SheetFiltersModal({
  destinationMode,
  specificPlaces,
  selected,
  hotelStars,
  reviewScore,
  onClose,
  onSave,
}: {
  destinationMode: "any" | "specific";
  specificPlaces: string[];
  selected: string[];
  hotelStars: number | null;
  reviewScore: number | null;
  onClose: () => void;
  onSave: (value: {
    destinationMode: "any" | "specific";
    specificPlaces: string[];
    selected: string[];
    hotelStars: number | null;
    reviewScore: number | null;
  }) => void;
}) {
  const [nextDestinationMode, setNextDestinationMode] = useState(destinationMode);
  const [nextPlaces, setNextPlaces] = useState(specificPlaces);
  const [nextSelected, setNextSelected] = useState(selected);
  const [nextStars, setNextStars] = useState(hotelStars);
  const [nextReviews, setNextReviews] = useState(reviewScore);
  const allVibes = VIBES;
  const destinationPills = allVibes.filter(
    (vibe) => vibe.category === "destination" || vibe.category === "mood",
  );
  const climatePills = allVibes.filter((vibe) => vibe.category === "climate");
  const stayPills = allVibes.filter((vibe) => vibe.category === "stay");
  const lodging = stayPills.filter((vibe) => LODGING_TYPES.includes(vibe.id));
  const amenities = stayPills.filter((vibe) => !LODGING_TYPES.includes(vibe.id));
  const toggleLocal = (id: string) =>
    setNextSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
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
            <div className="font-display text-xl font-semibold">Filtry arkusza</div>
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
            onClick={() => setNextDestinationMode("any")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
              nextDestinationMode === "any" ? "bg-background shadow-pop" : "text-muted-foreground"
            }`}
          >
            Dowolne miejsce
          </button>
          <button
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
          <div className="rounded-2xl border border-border bg-background p-3">
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

        <div className="mt-5 space-y-4 rounded-2xl bg-brand-green-soft/30 p-4">
          <FilterPillGroup
            title="Rodzaj zakwaterowania"
            pills={lodging}
            selected={nextSelected}
            toggle={toggleLocal}
          />
          <FilterPillGroup
            title="Standard i udogodnienia"
            pills={amenities}
            selected={nextSelected}
            toggle={toggleLocal}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <NumberThresholdMini
              title="Liczba gwiazdek"
              value={nextStars}
              suffix="+"
              min={1}
              max={5}
              onChange={setNextStars}
            />
            <NumberThresholdMini
              title="Opinie"
              value={nextReviews}
              suffix="/10+"
              min={1}
              max={10}
              onChange={setNextReviews}
            />
          </div>
        </div>

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
                reviewScore: nextReviews,
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
