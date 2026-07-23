import "leaflet/dist/leaflet.css";

import type { LatLngTuple, LayerGroup, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { VoyaResultRow } from "@/lib/voya-search";
import { cn } from "@/lib/utils";

type LeafletModule = typeof import("leaflet");

export type OfferMapProps = {
  rows: VoyaResultRow[];
  selected: VoyaResultRow | null;
  onSelect: (offer: VoyaResultRow) => void;
  className?: string;
};

type PlacedOffer = {
  coordinates: LatLngTuple;
  row: VoyaResultRow;
};

const DEFAULT_CENTER: LatLngTuple = [46.7, 14.2];

// Airport coordinates are used first because they are the most precise location
// already present in VoyaResultRow. Destination and country lookups provide a
// useful fallback for demo and imported rows without an IATA code.
const AIRPORT_COORDINATES: Record<string, LatLngTuple> = {
  AGP: [36.6749, -4.4991],
  ALC: [38.2822, -0.5582],
  ATH: [37.9364, 23.9445],
  AYT: [36.8987, 30.8005],
  BCN: [41.2974, 2.0833],
  CHQ: [35.5317, 24.1497],
  CTA: [37.4668, 15.0664],
  DBV: [42.5614, 18.2682],
  FAO: [37.0144, -7.9659],
  FCO: [41.8003, 12.2389],
  HER: [35.3397, 25.1803],
  IBZ: [38.8729, 1.3731],
  IST: [41.2753, 28.7519],
  LCA: [34.8751, 33.6249],
  LIS: [38.7742, -9.1342],
  LPA: [27.9319, -15.3866],
  MAD: [40.4983, -3.5676],
  NAP: [40.886, 14.2908],
  NCE: [43.6653, 7.215],
  OPO: [41.2421, -8.6789],
  PMI: [39.5517, 2.7388],
  RAK: [31.6069, -8.0363],
  RHO: [36.4054, 28.0862],
  SOF: [42.6967, 23.4114],
  SPU: [43.5389, 16.298],
  TFS: [28.0445, -16.5725],
  VLC: [39.4893, -0.4816],
  WAW: [52.1657, 20.9671],
  ZAD: [44.1083, 15.3467],
};

const DESTINATION_COORDINATES: Record<string, LatLngTuple> = {
  alicante: [38.3452, -0.481],
  ateny: [37.9838, 23.7275],
  athens: [37.9838, 23.7275],
  barcelona: [41.3874, 2.1686],
  barcelonie: [41.3874, 2.1686],
  chania: [35.5138, 24.018],
  dubrownik: [42.6507, 18.0944],
  faro: [37.0194, -7.9304],
  ibiza: [38.9067, 1.4206],
  kreta: [35.2401, 24.8093],
  larnaka: [34.9003, 33.6232],
  lizbona: [38.7223, -9.1393],
  malaga: [36.7213, -4.4214],
  marrakesz: [31.6295, -7.9811],
  naples: [40.8518, 14.2681],
  neapol: [40.8518, 14.2681],
  nicea: [43.7102, 7.262],
  palma: [39.5696, 2.6502],
  "palma de mallorca": [39.5696, 2.6502],
  porto: [41.1579, -8.6291],
  rhodes: [36.4341, 28.2176],
  rodos: [36.4341, 28.2176],
  rzym: [41.9028, 12.4964],
  split: [43.5081, 16.4402],
  stambul: [41.0082, 28.9784],
  valencia: [39.4699, -0.3763],
  walencja: [39.4699, -0.3763],
  zadar: [44.1194, 15.2314],
};

const COUNTRY_COORDINATES: Record<string, LatLngTuple> = {
  bulgaria: [42.7339, 25.4858],
  bulgaria_pl: [42.7339, 25.4858],
  chorwacja: [45.1, 15.2],
  croatia: [45.1, 15.2],
  cypr: [35.1264, 33.4299],
  cyprus: [35.1264, 33.4299],
  grecja: [39.0742, 21.8243],
  greece: [39.0742, 21.8243],
  hiszpania: [40.4637, -3.7492],
  italy: [41.8719, 12.5674],
  maroko: [31.7917, -7.0926],
  morocco: [31.7917, -7.0926],
  portugalia: [39.3999, -8.2245],
  portugal: [39.3999, -8.2245],
  spain: [40.4637, -3.7492],
  turcja: [38.9637, 35.2433],
  turkey: [38.9637, 35.2433],
  wlochy: [41.8719, 12.5674],
};

const priceFormatter = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 0,
});

export function OfferMap({ rows, selected, onSelect, className }: OfferMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, LeafletMarker>());
  const onSelectRef = useRef(onSelect);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const placedOffers = useMemo(() => placeOffers(rows), [rows]);
  const selectedId = selected?.id ?? null;

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;
    const markers = markersRef.current;

    async function initialiseMap() {
      try {
        const leaflet = await import("leaflet");
        const container = containerRef.current;
        if (disposed || !container) return;

        const map = leaflet.map(container, {
          attributionControl: true,
          minZoom: 2,
          scrollWheelZoom: true,
          worldCopyJump: true,
          zoomControl: false,
        });

        leaflet.control.zoom({ position: "topright" }).addTo(map);
        leaflet
          .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          })
          .addTo(map);

        const layer = leaflet.layerGroup().addTo(map);
        leafletRef.current = leaflet;
        mapRef.current = map;
        layerRef.current = layer;
        map.setView(DEFAULT_CENTER, 4, { animate: false });

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }));
          resizeObserver.observe(container);
        }

        window.requestAnimationFrame(() => map.invalidateSize({ pan: false }));
        if (!disposed) setIsReady(true);
      } catch {
        if (!disposed) setHasError(true);
      }
    }

    void initialiseMap();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      markers.clear();
      layerRef.current = null;
      leafletRef.current = null;
      const map = mapRef.current;
      mapRef.current = null;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!isReady || !leaflet || !map || !layer) return;

    layer.clearLayers();
    markersRef.current.clear();

    placedOffers.forEach(({ coordinates, row }) => {
      const marker = leaflet.marker(coordinates, {
        icon: makeOfferIcon(leaflet, row, false),
        keyboard: true,
        riseOnHover: true,
        title: `${row.destination}, ${formatPrice(row)}`,
      });

      marker.bindTooltip(makeTooltip(row), {
        className: "voya-offer-map-tooltip",
        direction: "top",
        offset: [0, -10],
        opacity: 1,
      });
      marker.bindPopup(makePopup(row), {
        className: "voya-offer-map-popup",
        closeButton: false,
        maxWidth: 270,
        offset: [0, -12],
      });
      marker.on("click", () => onSelectRef.current(row));
      marker.addTo(layer);
      markersRef.current.set(row.id, marker);
    });

    if (placedOffers.length === 1) {
      map.setView(placedOffers[0].coordinates, 9, { animate: false });
    } else if (placedOffers.length > 1) {
      map.fitBounds(leaflet.latLngBounds(placedOffers.map(({ coordinates }) => coordinates)), {
        animate: false,
        maxZoom: 7,
        paddingBottomRight: [52, 52],
        paddingTopLeft: [52, 52],
      });
    } else {
      map.setView(DEFAULT_CENTER, 4, { animate: false });
    }
  }, [isReady, placedOffers]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!isReady || !leaflet) return;

    for (const { row } of placedOffers) {
      const marker = markersRef.current.get(row.id);
      if (!marker) continue;
      const isSelected = row.id === selectedId;
      marker.setIcon(makeOfferIcon(leaflet, row, isSelected));
      marker.setZIndexOffset(isSelected ? 1000 : 0);
    }

    const selectedMarker = selectedId ? markersRef.current.get(selectedId) : null;
    if (map && selectedMarker) {
      map.panInside(selectedMarker.getLatLng(), {
        animate: true,
        padding: [80, 80],
      });
    }
  }, [isReady, placedOffers, selectedId]);

  return (
    <div
      className={cn(
        "relative min-h-[440px] overflow-hidden rounded-lg border border-border bg-muted shadow-soft",
        "[&_.leaflet-control-attribution]:bg-background/80 [&_.leaflet-control-attribution]:backdrop-blur-md",
        "[&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution_a]:text-brand-blue-ink",
        "[&_.leaflet-control-zoom]:m-3 [&_.leaflet-control-zoom]:overflow-hidden [&_.leaflet-control-zoom]:rounded-lg",
        "[&_.leaflet-control-zoom]:border [&_.leaflet-control-zoom]:border-white/80 [&_.leaflet-control-zoom]:shadow-soft",
        "[&_.leaflet-control-zoom_a]:border-border [&_.leaflet-control-zoom_a]:bg-card/95 [&_.leaflet-control-zoom_a]:text-foreground",
        "[&_.voya-offer-map-popup_.leaflet-popup-content-wrapper]:rounded-lg [&_.voya-offer-map-popup_.leaflet-popup-content-wrapper]:shadow-pop",
        "[&_.voya-offer-map-tooltip]:rounded-md [&_.voya-offer-map-tooltip]:border-border [&_.voya-offer-map-tooltip]:shadow-soft",
        className,
      )}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        aria-label="Interaktywna mapa ofert hotelowych"
        role="region"
      />

      {isReady && !hasError && rows.length > 0 && (
        <div className="pointer-events-none absolute left-3 top-3 z-[500] inline-flex items-center gap-1.5 rounded-md border border-white/80 bg-card/90 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-soft backdrop-blur-md">
          <MapPin className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
          {formatLocationsCount(rows.length)}
        </div>
      )}

      {!isReady && !hasError && (
        <div className="absolute inset-0 z-[900] grid place-items-center bg-card/80 backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Ładowanie mapy…
          </div>
        </div>
      )}

      {isReady && rows.length === 0 && (
        <div className="absolute inset-0 z-[500] grid place-items-center bg-card/55 p-6 backdrop-blur-[2px]">
          <div className="max-w-xs rounded-lg border border-border bg-card/95 p-4 text-center shadow-soft">
            <MapPin className="mx-auto mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold">Brak ofert do pokazania</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Zmień filtry, aby zobaczyć lokalizacje na mapie.
            </p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-[900] grid place-items-center bg-card p-6 text-center">
          <div>
            <MapPin className="mx-auto mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold">Nie udało się załadować mapy</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sprawdź połączenie z internetem i spróbuj ponownie.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function placeOffers(rows: VoyaResultRow[]): PlacedOffer[] {
  const groups = new Map<string, Array<{ coordinates: LatLngTuple; row: VoyaResultRow }>>();

  rows.forEach((row) => {
    const coordinates = resolveCoordinates(row);
    const key = `${coordinates[0].toFixed(4)}:${coordinates[1].toFixed(4)}`;
    const group = groups.get(key) ?? [];
    group.push({ coordinates, row });
    groups.set(key, group);
  });

  return [...groups.values()].flatMap((group) =>
    group.map(({ coordinates, row }, index) => ({
      coordinates: spreadCoordinates(coordinates, index, group.length),
      row,
    })),
  );
}

function resolveCoordinates(row: VoyaResultRow): LatLngTuple {
  const iata = row.destIata.trim().toUpperCase();
  if (AIRPORT_COORDINATES[iata]) return AIRPORT_COORDINATES[iata];

  const destination = normalizeLocation(row.destination);
  if (DESTINATION_COORDINATES[destination]) return DESTINATION_COORDINATES[destination];

  const destinationPart = Object.keys(DESTINATION_COORDINATES).find((candidate) =>
    destination.includes(candidate),
  );
  if (destinationPart) return DESTINATION_COORDINATES[destinationPart];

  const country = normalizeLocation(row.country);
  if (COUNTRY_COORDINATES[country]) return COUNTRY_COORDINATES[country];

  return DEFAULT_CENTER;
}

function spreadCoordinates(
  coordinates: LatLngTuple,
  index: number,
  groupSize: number,
): LatLngTuple {
  if (groupSize === 1) return coordinates;

  const ring = Math.floor(index / 8) + 1;
  const positionInRing = index % 8;
  const angle = (positionInRing / Math.min(8, groupSize)) * Math.PI * 2;
  const distance = 0.012 * ring;
  const longitudeCorrection = Math.max(0.35, Math.cos((coordinates[0] * Math.PI) / 180));

  return [
    coordinates[0] + Math.sin(angle) * distance,
    coordinates[1] + (Math.cos(angle) * distance) / longitudeCorrection,
  ];
}

function normalizeLocation(value: string) {
  const normalized = value
    .trim()
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[–—]/g, "-");

  if (normalized === "bulgaria") return "bulgaria_pl";
  return normalized;
}

function makeOfferIcon(leaflet: LeafletModule, row: VoyaResultRow, isSelected: boolean) {
  const root = document.createElement("div");
  root.className = cn(
    "relative grid w-max max-w-[12rem] -translate-x-1/2 -translate-y-full cursor-pointer select-none gap-0.5 rounded-lg border px-2.5 py-1.5 text-left shadow-[0_4px_14px_rgba(15,23,42,0.28)] transition-transform duration-150 hover:-translate-y-[calc(100%+2px)] hover:scale-[1.03]",
    isSelected
      ? "border-brand-blue bg-brand-blue text-white"
      : "border-slate-200 bg-white text-foreground",
  );

  const destination = document.createElement("span");
  destination.className = cn(
    "block max-w-[8.5rem] truncate text-[10px] font-medium leading-tight",
    isSelected ? "text-white/85" : "text-slate-500",
  );
  destination.textContent = row.destination;

  const price = document.createElement("span");
  price.className = "block whitespace-nowrap text-[13px] font-bold leading-tight";
  price.textContent = formatPrice(row);

  const pointer = document.createElement("span");
  pointer.className = cn(
    "absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r",
    isSelected ? "border-brand-blue bg-brand-blue" : "border-slate-200 bg-white",
  );
  pointer.setAttribute("aria-hidden", "true");

  root.append(destination, price, pointer);

  return leaflet.divIcon({
    className: "",
    html: root,
    iconAnchor: [0, 12],
    iconSize: [0, 0],
  });
}

function makeTooltip(row: VoyaResultRow) {
  const root = document.createElement("div");
  root.className = "grid gap-0.5 px-0.5 py-0.5";

  const hotel = document.createElement("strong");
  hotel.className = "font-display text-xs text-foreground";
  hotel.textContent = row.hotel;

  const details = document.createElement("span");
  details.className = "text-[10px] text-muted-foreground";
  details.textContent = `${row.destination} · ${formatPrice(row)}`;

  root.append(hotel, details);
  return root;
}

function makePopup(row: VoyaResultRow) {
  const root = document.createElement("div");
  root.className = "grid min-w-48 gap-1 py-0.5";

  const destination = document.createElement("strong");
  destination.className = "font-display text-sm text-foreground";
  destination.textContent = row.destination;

  const hotel = document.createElement("span");
  hotel.className = "text-xs text-muted-foreground";
  hotel.textContent = row.hotel;

  const footer = document.createElement("div");
  footer.className = "mt-1 flex items-center justify-between gap-3 border-t border-border pt-2";

  const dates = document.createElement("span");
  dates.className = "max-w-32 truncate text-[10px] text-muted-foreground";
  dates.textContent = row.dates;

  const price = document.createElement("strong");
  price.className = "whitespace-nowrap text-xs text-brand-blue-ink";
  price.textContent = formatPrice(row);

  footer.append(dates, price);
  root.append(destination, hotel, footer);
  return root;
}

function formatPrice(row: VoyaResultRow) {
  return `${priceFormatter.format(row.price)} ${row.currency === "PLN" ? "zł" : row.currency}`;
}

function formatLocationsCount(count: number) {
  if (count === 1) return "1 oferta";
  if (count >= 2 && count <= 4) return `${count} oferty`;
  return `${count} ofert`;
}
