import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Filter,
  Heart,
  HelpCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  ThumbsDown,
  Trash2,
} from "lucide-react";
import { TopBar } from "@/components/voya/TopBar";
import {
  fetchVoyaOffers,
  runLimitedVoyaSearch,
  toVoyaResult,
  type VoyaResultRow,
} from "@/lib/voya-search";

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
  no: { label: "Odpada", tone: "bg-muted text-muted-foreground" },
} as const;

const rowTone: Record<VoyaResultRow["status"], string> = {
  loved: "bg-brand-green-soft/40 hover:bg-brand-green-soft/60",
  maybe: "bg-brand-yellow-soft/40 hover:bg-brand-yellow-soft/60",
  pending: "hover:bg-muted/40",
  no: "line-through opacity-50 hover:opacity-70",
};

function ResultsSheet() {
  const [rows, setRows] = useState<VoyaResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningSearch, setRunningSearch] = useState(false);
  const [message, setMessage] = useState("Wczytuje lokalne wyniki...");
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

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

  const avgPrice = useMemo(() => {
    if (!rows.length) return 0;
    return Math.round(rows.reduce((sum, row) => sum + row.price, 0) / rows.length);
  }, [rows]);

  const shortList = rows.filter((row) => row.status === "loved" || row.status === "maybe").length;

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

  const runSearch = async () => {
    if (runningSearch) return;
    setRunningSearch(true);
    setError("");
    setMessage("Odpalam jedno limitowane wyszukiwanie: 1 lot, 1 scroll.");
    try {
      const result = await runLimitedVoyaSearch();
      setRows((result.rows || []).map(toVoyaResult));
      setMessage(result.message || "Limitowane wyszukiwanie zakonczone.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Limitowane wyszukiwanie nie powiodlo sie.");
      await loadRows().catch(() => undefined);
    } finally {
      setRunningSearch(false);
    }
  };

  const updateStatus = (id: string, status: VoyaResultRow["status"]) =>
    setRows((items) => items.map((row) => (row.id === id ? { ...row, status } : row)));
  const removeRow = (id: string) => setRows((items) => items.filter((row) => row.id !== id));

  return (
    <div className={`min-h-screen bg-background ${fullscreen ? "fixed inset-0 z-40 overflow-auto" : ""}`}>
      {!fullscreen && <TopBar />}

      {!fullscreen && (
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <Link to="/" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Nowe wyszukiwanie
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✈️</span>
                  <h1 className="font-display text-2xl font-bold sm:text-3xl">Wyniki VoyaSearchEngine</h1>
                </div>
                <div className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  {message}
                </div>
                {error && (
                  <div className="mt-2 rounded-xl bg-brand-pink-soft px-3 py-2 text-xs text-foreground">
                    {error}
                  </div>
                )}
              </div>
              <button
                onClick={runSearch}
                disabled={runningSearch}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-pop disabled:opacity-60"
              >
                <Search className={`h-4 w-4 ${runningSearch ? "animate-pulse" : ""}`} />
                {runningSearch ? "Szukam limitowo..." : "Szukaj limitowo"}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Oferty" value={`${rows.length}`} tone="blue" />
              <Stat label="Krotka lista" value={`${shortList}`} tone="green" />
              <Stat label="Srednia cena" value={avgPrice ? `${avgPrice} zl` : "-"} tone="yellow" />
              <Stat label="Basen TAK" value={`${rows.filter((row) => row.pool === "yes").length}`} tone="pink" />
            </div>
          </div>
        </div>
      )}

      <div className={`sticky ${fullscreen ? "top-0" : "top-16"} z-20 border-b border-border bg-background/90 backdrop-blur`}>
        <div className={`mx-auto flex ${fullscreen ? "max-w-none" : "max-w-7xl"} flex-wrap items-center gap-2 px-4 py-3 sm:px-6`}>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
            <Filter className="h-3 w-3" /> Filtry MVP: cena, dni, basen
          </button>
          <button
            onClick={refresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/40 bg-brand-green-soft px-3 py-1.5 text-xs font-semibold text-brand-green-ink transition-colors hover:brightness-105 disabled:opacity-70"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing || loading ? "animate-spin" : ""}`} />
            {loading ? "Wczytuje..." : "Wczytaj z output"}
          </button>
          <div className="ml-auto">
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
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <Th>Destynacja</Th>
                  <Th>Lot</Th>
                  <Th>Hotel</Th>
                  <Th>Basen</Th>
                  <Th>Dni</Th>
                  <Th className="text-right">Cena / os.</Th>
                  <Th>Linki</Th>
                  <Th>Status</Th>
                  <Th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const status = statusMeta[row.status];
                  return (
                    <tr key={row.id} className={`border-b border-border last:border-0 transition-colors ${rowTone[row.status]}`}>
                      <Td>
                        <Link to="/offer/$id" params={{ id: row.id }} className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl">{row.flag}</span>
                          <div>
                            <div className="font-semibold">{row.destination}</div>
                            <div className="text-xs text-muted-foreground">{row.country || row.destIata}</div>
                          </div>
                        </Link>
                      </Td>
                      <Td className="text-xs text-muted-foreground">
                        <div>{row.flight}</div>
                        <div>{row.dates}</div>
                      </Td>
                      <Td>
                        <div className="font-medium">{row.hotel}</div>
                        <div className="text-xs text-muted-foreground">{row.hotelArea || row.propertyType}</div>
                        {row.hotelStars > 0 && <div className="text-xs text-brand-yellow-ink">{"★".repeat(row.hotelStars)}</div>}
                      </Td>
                      <Td>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${poolTone(row.pool)}`}>
                          {poolLabel(row.pool)}
                        </span>
                      </Td>
                      <Td>{row.days || "-"}</Td>
                      <Td className="text-right">
                        <div className="font-display text-base font-semibold">{formatPrice(row.price)}</div>
                        <div className="text-[10px] text-muted-foreground">
                          lot {formatPrice(row.flightPrice)} + hotel {formatPrice(row.hotelPrice)}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          {row.flightLink && <ExternalButton href={row.flightLink} label="Lot" />}
                          {row.hotelLink && <ExternalButton href={row.hotelLink} label="Hotel" />}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateStatus(row.id, "loved")}
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${row.status === "loved" ? "bg-brand-green text-white" : "hover:bg-muted"}`}
                            aria-label="Bierzemy"
                          >
                            <Heart className={`h-4 w-4 ${row.status === "loved" ? "fill-white text-white" : ""}`} />
                          </button>
                          <button
                            onClick={() => updateStatus(row.id, "maybe")}
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${row.status === "maybe" ? "bg-brand-yellow text-brand-yellow-ink" : "hover:bg-muted"}`}
                            aria-label="Moze"
                          >
                            ?
                          </button>
                          <button
                            onClick={() => updateStatus(row.id, "pending")}
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${row.status === "pending" ? "bg-muted" : "hover:bg-muted"}`}
                            aria-label="Do sprawdzenia"
                          >
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => updateStatus(row.id, "no")}
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${row.status === "no" ? "bg-foreground text-background" : "hover:bg-muted"}`}
                            aria-label="Odpada"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                          <span className={`ml-1 hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline ${status.tone}`}>
                            {status.label}
                          </span>
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
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "blue" | "green" | "yellow" | "pink" }) {
  const map = {
    blue: "bg-brand-blue-soft text-brand-blue-ink",
    green: "bg-brand-green-soft text-brand-green-ink",
    yellow: "bg-brand-yellow-soft text-brand-yellow-ink",
    pink: "bg-brand-pink-soft text-foreground",
  };
  return (
    <div className={`rounded-2xl p-4 ${map[tone]}`}>
      <div className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function ExternalButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs hover:bg-brand-blue-soft"
    >
      {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function formatPrice(value: number) {
  if (!value) return "-";
  return `${Math.round(value).toLocaleString("pl-PL")} zl`;
}

function poolLabel(pool: VoyaResultRow["pool"]) {
  if (pool === "yes") return "TAK";
  if (pool === "no") return "NIE";
  return "NIEPOTW.";
}

function poolTone(pool: VoyaResultRow["pool"]) {
  if (pool === "yes") return "bg-brand-green-soft text-brand-green-ink";
  if (pool === "no") return "bg-brand-pink-soft text-foreground";
  return "bg-muted text-muted-foreground";
}
