import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, ExternalLink, Heart, Plane } from "lucide-react";
import { TopBar } from "@/components/voya/TopBar";
import { CountryFlag } from "@/components/voya/CountryFlag";
import { fetchVoyaOffers, findOffer, type VoyaResultRow } from "@/lib/voya-search";

export const Route = createFileRoute("/offer/$id")({
  component: OfferDetail,
  head: () => ({
    meta: [{ title: "Szczegoly oferty · Voya" }],
  }),
});

function OfferDetail() {
  const { id } = Route.useParams();
  const [offer, setOffer] = useState<VoyaResultRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchVoyaOffers()
      .then(({ rows }) => {
        if (!active) return;
        setOffer(findOffer(rows, id) ?? rows[0] ?? null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Nie udalo sie wczytac oferty.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link
          to="/results/$id"
          params={{ id: "demo" }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Wroc do katalogu
        </Link>

        {loading && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Wczytuje oferte...
          </div>
        )}
        {error && (
          <div className="mt-8 rounded-2xl bg-brand-pink-soft p-6 text-sm text-foreground">
            {error}
          </div>
        )}
        {!loading && !offer && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Nie znaleziono oferty.
          </div>
        )}

        {offer && (
          <>
            <div className="mt-4 rounded-3xl bg-hero-gradient p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <CountryFlag
                      flag={offer.flag}
                      label={offer.country || offer.destination}
                      className="h-9 w-14"
                    />
                    <div>
                      <h1 className="font-display text-3xl font-bold sm:text-4xl">
                        {offer.destination}
                      </h1>
                      <div className="text-sm text-foreground/70">
                        {offer.dates} · {offer.originIata} → {offer.destIata}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {offer.vibes.map((v, i) => (
                      <span
                        key={`${v}-${i}`}
                        className="rounded-full bg-card/90 px-3 py-1 text-sm shadow-soft"
                      >
                        {v}
                      </span>
                    ))}
                    <span className="rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white">
                      Match {offer.match}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
                    <Heart className="h-4 w-4" />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
                    <Bell className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-blue">
                  <Plane className="h-3.5 w-3.5" /> Lot
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <div>
                    <div className="font-display text-2xl font-bold">{offer.originIata || "?"}</div>
                    <div className="text-xs text-muted-foreground">{offer.origin}</div>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    <div>{offer.days || "-"} dni</div>
                    <div className="my-1 h-px bg-border" />
                    <div>
                      {offer.depart} → {offer.returnDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold">{offer.destIata || "?"}</div>
                    <div className="text-xs text-muted-foreground">{offer.destination}</div>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-muted p-3 text-xs">
                  <div className="flex justify-between">
                    <span>Cena lotu / os.</span>
                    <span className="font-medium">{formatPrice(offer.flightPrice)}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span>Link</span>
                    {offer.flightLink ? (
                      <External href={offer.flightLink} label="Otworz lot" />
                    ) : (
                      <span>brak</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-green">
                  Hotel
                </div>
                <div className="font-display text-xl font-bold">{offer.hotel}</div>
                {offer.hotelStars > 0 && (
                  <div className="mt-1 text-brand-yellow-ink">{"★".repeat(offer.hotelStars)}</div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Info label="Basen" value={poolText(offer.pool)} />
                  <Info label="Cena hotelu / os." value={formatPrice(offer.hotelPrice)} />
                  <Info label="Okolica" value={offer.hotelArea || "-"} />
                  <Info label="Typ" value={offer.propertyType || "-"} />
                </div>
                <div className="mt-4 rounded-xl bg-muted p-3 text-xs">
                  <div className="flex justify-between">
                    <span>Link</span>
                    {offer.hotelLink ? (
                      <External href={offer.hotelLink} label="Otworz hotel" />
                    ) : (
                      <span>brak</span>
                    )}
                  </div>
                  {offer.poolEvidence && (
                    <div className="mt-2 text-muted-foreground">{offer.poolEvidence}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Cena laczna / os.
                </div>
                <div className="mt-1 font-display text-4xl font-bold">
                  {formatPrice(offer.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  lot + hotel, wedlug danych z output/offers.json
                </div>
              </div>
              <div className="flex gap-2">
                {offer.flightLink && <External href={offer.flightLink} label="Lot" large />}
                {offer.hotelLink && <External href={offer.hotelLink} label="Hotel" large />}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}

function External({
  href,
  label,
  large = false,
}: {
  href: string;
  label: string;
  large?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1 rounded-full bg-brand-blue text-white ${large ? "px-5 py-2 text-sm font-semibold" : "px-2 py-1 text-xs"}`}
    >
      {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function formatPrice(value: number) {
  if (!value) return "-";
  return `${Math.round(value).toLocaleString("pl-PL")} zl`;
}

function poolText(pool: VoyaResultRow["pool"]) {
  if (pool === "yes") return "TAK";
  if (pool === "no") return "NIE";
  return "NIEPOTW.";
}
