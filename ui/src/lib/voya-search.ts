import { DEMO_RESULTS, type ResultRow } from "@/lib/voya-data";

export type BackendOffer = {
  origin?: string;
  origin_iata?: string;
  country?: string;
  dest_iata?: string;
  dest_name?: string;
  stay_city?: string;
  depart?: string;
  return?: string;
  days?: number;
  nights?: number;
  flight_price?: number;
  flight_link?: string;
  hotel_name?: string;
  hotel_area?: string;
  property_type?: string;
  accommodation_type?: string;
  stars?: number;
  review_score?: number;
  review_count?: number;
  hotel_price?: number;
  hotel_link?: string;
  total?: number;
  has_outdoor_pool?: boolean | null;
  outdoor_evidence?: string;
};

export type OffersPayload = {
  rows: BackendOffer[];
  source: string;
  updatedAt?: string;
  message?: string;
};

export type SearchPayload = OffersPayload & {
  ok: boolean;
  log?: string;
};

export type VoyaResultRow = ResultRow & {
  origin: string;
  originIata: string;
  destIata: string;
  country: string;
  depart: string;
  returnDate: string;
  days: number;
  nights: number;
  flightPrice: number;
  hotelPrice: number;
  hotelArea: string;
  propertyType: string;
  reviewScore: number;
  pool: "yes" | "no" | "unknown";
  poolEvidence: string;
  flightLink: string;
  hotelLink: string;
  source: "voya" | "demo";
};

const FALLBACK_ROWS: VoyaResultRow[] = DEMO_RESULTS.map((row) => ({
  ...row,
  origin: "Warszawa",
  originIata: "WAW",
  destIata: "",
  country: "",
  depart: "",
  returnDate: "",
  days: 0,
  nights: 0,
  flightPrice: 0,
  hotelPrice: row.price,
  hotelArea: "",
  propertyType: "hotel",
  reviewScore: 0,
  pool: row.vibes.includes("🏊") ? "yes" : "unknown",
  poolEvidence: "",
  flightLink: "",
  hotelLink: "",
  source: "demo" as const,
}));

const COUNTRY_FLAGS: Record<string, string> = {
  ES: "🇪🇸",
  Hiszpania: "🇪🇸",
  Spain: "🇪🇸",
  PT: "🇵🇹",
  Portugalia: "🇵🇹",
  IT: "🇮🇹",
  Włochy: "🇮🇹",
  Wlochy: "🇮🇹",
  GR: "🇬🇷",
  Grecja: "🇬🇷",
  HR: "🇭🇷",
  Chorwacja: "🇭🇷",
  BG: "🇧🇬",
  Bulgaria: "🇧🇬",
  CY: "🇨🇾",
  Cypr: "🇨🇾",
  MA: "🇲🇦",
  Maroko: "🇲🇦",
  TR: "🇹🇷",
  Turcja: "🇹🇷",
};

const COUNTRY_NAMES: Record<string, string> = {
  ES: "Hiszpania",
  PT: "Portugalia",
  IT: "Włochy",
  GR: "Grecja",
  HR: "Chorwacja",
  BG: "Bułgaria",
  CY: "Cypr",
  MA: "Maroko",
  TR: "Turcja",
};

function numberValue(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function shortDate(value?: string): string {
  if (!value) return "";
  const [, month, day] = value.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? [];
  return month && day ? `${day}.${month}` : value;
}

function stableId(row: BackendOffer, index: number): string {
  const raw = [
    row.origin_iata,
    row.dest_iata,
    row.depart,
    row.return,
    row.hotel_name,
    row.total,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `voya-${index}-${hash.toString(36)}`;
}

function matchScore(row: BackendOffer): number {
  const review = numberValue(row.review_score);
  const price = numberValue(row.total);
  const pool = row.has_outdoor_pool === true ? 6 : 0;
  const reviewPart = review ? Math.min(34, review * 3.4) : 16;
  const pricePart = price <= 2500 ? 34 : price <= 3000 ? 26 : price <= 3500 ? 18 : 10;
  const starsPart = Math.min(18, numberValue(row.stars) * 4);
  return Math.max(45, Math.min(98, Math.round(reviewPart + pricePart + starsPart + pool)));
}

export function toVoyaResult(row: BackendOffer, index: number): VoyaResultRow {
  const destination = row.stay_city || row.dest_name || row.dest_iata || "Oferta";
  const rawCountry = row.country || "";
  const country = COUNTRY_NAMES[rawCountry] ?? rawCountry;
  const total = numberValue(row.total);
  const pool: VoyaResultRow["pool"] =
    row.has_outdoor_pool === true ? "yes" : row.has_outdoor_pool === false ? "no" : "unknown";
  const vibes = [
    pool === "yes" ? "🏊" : null,
    row.property_type?.toLowerCase().includes("hotel") ? "🏨" : "🏡",
    total && total <= 3000 ? "💰" : null,
    "✈️",
  ].filter(Boolean) as string[];

  return {
    id: stableId(row, index),
    destination,
    flag: COUNTRY_FLAGS[rawCountry] ?? COUNTRY_FLAGS[country] ?? "🌍",
    hotel: row.hotel_name || "Hotel / apartament",
    hotelStars: Math.max(0, Math.round(numberValue(row.stars))),
    flight: `${row.origin_iata || row.origin || "?"} → ${row.dest_iata || row.dest_name || "?"}`,
    dates: `${shortDate(row.depart)} → ${shortDate(row.return)}${row.days ? ` · ${row.days} dni` : ""}`,
    price: Math.round(total || numberValue(row.hotel_price) + numberValue(row.flight_price)),
    currency: "PLN",
    match: matchScore(row),
    vibes,
    weather: "",
    weatherEmoji: "☀️",
    status: "pending",
    addedBy: "Voya",
    origin: row.origin || "",
    originIata: row.origin_iata || "",
    destIata: row.dest_iata || "",
    country,
    depart: row.depart || "",
    returnDate: row.return || "",
    days: numberValue(row.days),
    nights: numberValue(row.nights),
    flightPrice: numberValue(row.flight_price),
    hotelPrice: numberValue(row.hotel_price),
    hotelArea: row.hotel_area || "",
    propertyType: row.property_type || row.accommodation_type || "",
    reviewScore: numberValue(row.review_score),
    pool,
    poolEvidence: row.outdoor_evidence || "",
    flightLink: row.flight_link || "",
    hotelLink: row.hotel_link || "",
    source: "voya",
  };
}

async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchVoyaOffers(): Promise<{
  rows: VoyaResultRow[];
  payload: OffersPayload;
}> {
  try {
    const payload = await readJson<OffersPayload>("/api/voya/offers");
    const rows = (payload.rows || []).map(toVoyaResult);
    return { rows: rows.length ? rows : FALLBACK_ROWS, payload };
  } catch {
    const payload = await readJson<OffersPayload>("/voya-offers.json").catch(() => ({
      rows: [],
      source: "demo",
      message: "Brak lokalnego output/offers.json. Pokazuje demo UI.",
    }));
    const rows = (payload.rows || []).map(toVoyaResult);
    return { rows: rows.length ? rows : FALLBACK_ROWS, payload };
  }
}

export async function runLimitedVoyaSearch(): Promise<SearchPayload> {
  return readJson<SearchPayload>("/api/voya/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      limitFlights: 1,
      scrolls: 1,
      maxTotal: 3000,
      returnDate: "2026-08-08",
      minDays: 9,
    }),
  });
}

export function findOffer(rows: VoyaResultRow[], id: string): VoyaResultRow | undefined {
  return rows.find((row) => row.id === id);
}
