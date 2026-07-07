import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Building2, CalendarDays, Check, Compass, MapPin, Plane, Plus, Search, Sparkles, Users, X } from "lucide-react";
import { TopBar } from "@/components/voya/TopBar";
import { VibePill } from "@/components/voya/VibePill";
import { RotatingHero } from "@/components/voya/RotatingHero";
import { VIBES, DEPARTURE_COUNTRIES, type Vibe, type Country } from "@/lib/voya-data";

export const Route = createFileRoute("/")({
  component: SearchHome,
});

const LODGING_TYPES = ["allinclusive", "hotel", "apartment", "resort", "hostel", "villa", "glamping", "bnb", "boutique"];

function SearchHome() {
  const [selected, setSelected] = useState<string[]>(["pool", "party", "sun", "direct"]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [customVibes, setCustomVibes] = useState<Vibe[]>([]);

  // Skąd
  const [fromOpen, setFromOpen] = useState(false);
  const [fromAirport, setFromAirport] = useState<{ country: string; code: string; name: string }>({
    country: "Polska", code: "WAW", name: "Warszawa Chopin",
  });

  // Dokąd
  const [toOpen, setToOpen] = useState(false);
  const [toMode, setToMode] = useState<"vibe" | "specific">("vibe");
  const [toValue, setToValue] = useState<string>("");

  // Kiedy
  const [whenOpen, setWhenOpen] = useState(false);
  const [dateMode, setDateMode] = useState<"exact" | "flex">("flex");
  const [dateStart, setDateStart] = useState("2026-06-12");
  const [dateEnd, setDateEnd] = useState("2026-06-19");
  const [flexRange, setFlexRange] = useState(3);
  const [flexMonth, setFlexMonth] = useState("Czerwiec 2026");
  const [flexNights, setFlexNights] = useState(7);

  const allVibes = useMemo(() => [...VIBES, ...customVibes], [customVibes]);
  const grouped = useMemo(() => {
    const g: Record<string, Vibe[]> = { mood: [], climate: [], budget: [], stay: [], ai: [], destination: [], flight: [] };
    for (const v of allVibes) g[v.category].push(v);
    return g;
  }, [allVibes]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

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

  const whenLabel = dateMode === "exact"
    ? `${dateStart} → ${dateEnd}`
    : `${flexMonth} · ${flexNights} nocy · ±${flexRange} dni`;
  const toLabel = toMode === "vibe" ? "Wszędzie · dopasuj do vibe" : (toValue || "Wybierz destynację");

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <RotatingHero />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-blue" />
              AI szuka lotu + hotelu w jednym miejscu
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Wybierz <span className="rounded-2xl bg-brand-yellow px-3 py-1 text-brand-yellow-ink">vibe</span>,<br />
              nie destynację.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Filtruj po nastroju, pogodzie i budżecie. Zaplanuj wyjazd w arkuszu,
              który udostępnisz znajomym do wspólnej edycji.
            </p>
          </div>

          {/* Search card */}
          <div className="mx-auto mt-10 max-w-5xl">
            <div className="rounded-3xl border border-border bg-card p-3 shadow-soft sm:p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <Field
                  icon={<MapPin className="h-4 w-4 text-brand-blue" />}
                  label="Skąd" value={`${fromAirport.name} (${fromAirport.code})`}
                  col="sm:col-span-3" onClick={() => setFromOpen(true)}
                />
                <Field
                  icon={<ArrowRight className="h-4 w-4 text-brand-green" />}
                  label="Dokąd" value={toLabel}
                  col="sm:col-span-4" onClick={() => setToOpen(true)}
                />
                <Field
                  icon={<CalendarDays className="h-4 w-4 text-brand-yellow-ink" />}
                  label="Kiedy" value={whenLabel}
                  col="sm:col-span-3" onClick={() => setWhenOpen(true)}
                />
                <Field icon={<Users className="h-4 w-4 text-brand-pink" />} label="Kto" value="2 dorosłych" col="sm:col-span-2" />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{dateMode === "flex" ? `Elastyczne daty ±${flexRange} dni` : "Dokładne daty"}</span>
                  <span className="text-border">·</span>
                  <span>{selected.includes("direct") ? "Bez przesiadek" : "Bezpośrednie lub z 1 przesiadką"}</span>
                </div>
                <Link
                  to="/results/$id"
                  params={{ id: "demo" }}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-pop transition-transform hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Zaplanuj z AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vibe filters */}
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        {/* DOKĄD — destynacja */}
        {toMode === "vibe" && (
          <FilterZone
            icon={<Compass className="h-4 w-4" />}
            eyebrow="Dokąd"
            title="Filtry destynacji"
            caption="Jakie miejsce ma dopasować AI"
            tone="blue"
          >
            <PillGroup title="Nastrój" caption="Jak chcesz się poczuć" pills={grouped.mood} selected={selected} toggle={toggle} />
            <PillGroup title="Charakter miejsca" caption="Miasto, morze, zwiedzanie…" pills={grouped.destination} selected={selected} toggle={toggle} />
            <PillGroup title="Pogoda i klimat" pills={grouped.climate} selected={selected} toggle={toggle} />
          </FilterZone>
        )}

        {/* NOCLEG — hotel */}
        <FilterZone
          icon={<Building2 className="h-4 w-4" />}
          eyebrow="Nocleg"
          title="Filtry hotelu"
          caption="Rodzaj zakwaterowania i standard"
          tone="green"
        >
          <PillGroup
            title="Rodzaj zakwaterowania"
            caption="Hotel, apartament, willa, hostel…"
            pills={grouped.stay.filter((p) => LODGING_TYPES.includes(p.id))}
            selected={selected} toggle={toggle}
          />
          <PillGroup
            title="Standard i udogodnienia"
            caption="Gwiazdki, opinie, spa, dla dzieci…"
            pills={grouped.stay.filter((p) => !LODGING_TYPES.includes(p.id))}
            selected={selected} toggle={toggle}
          />
        </FilterZone>

        {/* LOT */}
        <FilterZone
          icon={<Plane className="h-4 w-4" />}
          eyebrow="Lot"
          title="Filtry lotu"
          caption="Przesiadki i czas lotu"
          tone="yellow"
        >
          <PillGroup title="" pills={grouped.flight} selected={selected} toggle={toggle} />
        </FilterZone>

        {grouped.ai.length > 0 && (
          <FilterZone
            icon={<Sparkles className="h-4 w-4" />}
            eyebrow="Twoje AI"
            title="Własne filtry AI"
            tone="pink"
          >
            <PillGroup title="" pills={grouped.ai} selected={selected} toggle={toggle} />
          </FilterZone>
        )}

        {/* Add AI filter */}
        <div className="mt-8 rounded-3xl border border-dashed border-brand-blue/40 bg-brand-blue-soft/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-2xl text-white shadow-pop">✨</span>
              <div>
                <div className="font-display text-lg font-semibold">Dodaj własny filtr AI</div>
                <div className="text-sm text-muted-foreground">
                  Opisz swój vibe słowami — np. „miejsce gdzie mogę uczyć się surfingu i pracować zdalnie".
                </div>
              </div>
            </div>
            <button
              onClick={() => setAiOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-pop"
            >
              <Plus className="h-4 w-4" /> Nowy filtr
            </button>
          </div>
        </div>

        {/* Selected summary */}
        <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-4">
          <span className="text-sm font-semibold">Aktywne ({selected.length}):</span>
          {selected.map((id) => {
            const v = allVibes.find((x) => x.id === id);
            if (!v) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                {v.emoji} {v.label}
                <button onClick={() => toggle(id)} className="ml-1 rounded-full hover:bg-background">
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {selected.length === 0 && <span className="text-sm text-muted-foreground">Brak — dodaj vibe powyżej</span>}
          <Link
            to="/results/$id"
            params={{ id: "demo" }}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white"
          >
            Pokaż wyniki <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* AI filter modal */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-pop">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue text-xl text-white">✨</span>
                <div>
                  <div className="font-display text-lg font-semibold">Nowy filtr AI</div>
                  <div className="text-xs text-muted-foreground">AI zamieni opis w kryteria wyszukiwania</div>
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
              {["digital nomad friendly", "spot na surfing", "kraj bez wizy", "wegańska kuchnia"].map((s) => (
                <button key={s} onClick={() => setAiPrompt(s)} className="rounded-full bg-muted px-3 py-1 hover:bg-brand-yellow-soft">
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setAiOpen(false)} className="rounded-full border border-border px-4 py-2 text-sm font-medium">
                Anuluj
              </button>
              <button onClick={addCustom} className="rounded-full bg-brand-blue px-5 py-2 text-sm font-semibold text-white">
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
          onSelect={(v) => { setFromAirport(v); setFromOpen(false); }}
        />
      )}

      {toOpen && (
        <ToModal
          mode={toMode} value={toValue}
          onClose={() => setToOpen(false)}
          onSelect={(m, v) => { setToMode(m); setToValue(v); setToOpen(false); }}
        />
      )}

      {whenOpen && (
        <WhenModal
          mode={dateMode} start={dateStart} end={dateEnd}
          flexRange={flexRange} flexMonth={flexMonth} flexNights={flexNights}
          onClose={() => setWhenOpen(false)}
          onSave={(v) => {
            setDateMode(v.mode); setDateStart(v.start); setDateEnd(v.end);
            setFlexRange(v.flexRange); setFlexMonth(v.flexMonth); setFlexNights(v.flexNights);
            setWhenOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Field({ icon, label, value, col, onClick }: { icon: React.ReactNode; label: string; value: string; col: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`group flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-left transition-colors hover:bg-muted ${col}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted group-hover:bg-background">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </button>
  );
}

function PillGroup({
  title, caption, pills, selected, toggle,
}: {
  title: string; caption?: string; pills: Vibe[]; selected: string[]; toggle: (id: string) => void;
}) {
  if (pills.length === 0) return null;
  return (
    <div className="mt-5 first:mt-0">
      {title && (
        <div className="mb-2.5 flex items-baseline justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground/70">{title}</h3>
          {caption && <span className="text-xs text-muted-foreground">{caption}</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {pills.map((v) => (
          <VibePill
            key={v.id}
            emoji={v.emoji}
            label={v.label}
            tone={v.tone}
            active={selected.includes(v.id)}
            onClick={() => toggle(v.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterZone({
  icon, eyebrow, title, caption, tone, children,
}: {
  icon: React.ReactNode; eyebrow: string; title: string; caption?: string;
  tone: "blue" | "green" | "yellow" | "pink"; children: React.ReactNode;
}) {
  const tones: Record<string, { border: string; bg: string; chip: string; bar: string }> = {
    blue:   { border: "border-brand-blue/25",   bg: "bg-brand-blue-soft/25",   chip: "bg-brand-blue text-white",       bar: "bg-brand-blue" },
    green:  { border: "border-brand-green/30",  bg: "bg-brand-green-soft/30",  chip: "bg-brand-green text-white",      bar: "bg-brand-green" },
    yellow: { border: "border-brand-yellow/50", bg: "bg-brand-yellow-soft/40", chip: "bg-brand-yellow text-brand-yellow-ink", bar: "bg-brand-yellow" },
    pink:   { border: "border-brand-pink/40",   bg: "bg-brand-pink-soft/40",   chip: "bg-brand-pink text-white",       bar: "bg-brand-pink" },
  };
  const t = tones[tone];
  return (
    <div className={`relative overflow-hidden rounded-3xl border ${t.border} ${t.bg} p-5 sm:p-6`}>
      <span className={`absolute left-0 top-0 h-full w-1.5 ${t.bar}`} aria-hidden />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full ${t.chip} px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-pop`}>
          {icon}
          {eyebrow}
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
        {caption && <span className="text-sm text-muted-foreground">· {caption}</span>}
      </div>
      {children}
    </div>
  );
}

function ModalShell({ title, subtitle, onClose, children, wide }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 pt-16 backdrop-blur-sm">
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-3xl border border-border bg-card p-6 shadow-pop`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-xl font-semibold">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FromModal({ selected, onClose, onSelect }: {
  selected: { country: string; code: string; name: string };
  onClose: () => void;
  onSelect: (v: { country: string; code: string; name: string }) => void;
}) {
  const [country, setCountry] = useState<Country>(
    DEPARTURE_COUNTRIES.find((c) => c.name === selected.country) ?? DEPARTURE_COUNTRIES[0],
  );
  const [q, setQ] = useState("");
  const filtered = DEPARTURE_COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <ModalShell wide title="Wybierz lotnisko wylotu" subtitle="Najpierw kraj, potem lotnisko" onClose={onClose}>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj kraju…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kraj wylotu</div>
          <div className="grid max-h-80 grid-cols-2 gap-1 overflow-y-auto pr-1">
            {filtered.map((c) => (
              <button key={c.code} onClick={() => setCountry(c)}
                className={`rounded-full px-3 py-1.5 text-left text-sm ${
                  country.code === c.code ? "bg-brand-blue text-white shadow-pop" : "hover:bg-muted"
                }`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-brand-blue-soft/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue-ink">Wybierz lotnisko</div>
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {country.airports.map((a) => {
              const active = selected.code === a.code;
              return (
                <button key={a.code}
                  onClick={() => onSelect({ country: country.name, code: a.code, name: a.name })}
                  className={`flex w-full items-center justify-between rounded-full px-3 py-1.5 text-left text-sm ${
                    active ? "bg-brand-blue text-white shadow-pop" : "bg-background hover:bg-muted"
                  }`}>
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

function ToModal({ mode, value, onClose, onSelect }: {
  mode: "vibe" | "specific"; value: string;
  onClose: () => void;
  onSelect: (mode: "vibe" | "specific", value: string) => void;
}) {
  const [m, setM] = useState(mode);
  const [v, setV] = useState(value);
  return (
    <ModalShell title="Dokąd chcesz lecieć?" subtitle="AI dopasuje najlepsze miejsca do Twojego vibe" onClose={onClose}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button onClick={() => setM("vibe")}
          className={`rounded-2xl border-2 p-4 text-left ${m === "vibe" ? "border-brand-green bg-brand-green-soft/40" : "border-border hover:bg-muted"}`}>
          <div className="text-2xl">✨</div>
          <div className="mt-2 font-semibold">Wszędzie · dopasuj do vibe</div>
          <div className="text-xs text-muted-foreground">AI wybierze destynację pasującą do filtrów</div>
        </button>
        <button onClick={() => setM("specific")}
          className={`rounded-2xl border-2 p-4 text-left ${m === "specific" ? "border-brand-blue bg-brand-blue-soft/40" : "border-border hover:bg-muted"}`}>
          <div className="text-2xl">📍</div>
          <div className="mt-2 font-semibold">Konkretne miejsce</div>
          <div className="text-xs text-muted-foreground">Wpisz kraj lub miasto</div>
        </button>
      </div>
      {m === "specific" && (
        <div className="mt-4">
          <input value={v} onChange={(e) => setV(e.target.value)} placeholder="np. Lizbona, Grecja, Bali…"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-blue" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Lizbona", "Barcelona", "Rzym", "Kreta", "Bali", "Tokio", "Nowy Jork"].map((s) => (
              <button key={s} onClick={() => setV(s)} className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-brand-yellow-soft">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm font-medium">Anuluj</button>
        <button onClick={() => onSelect(m, m === "vibe" ? "" : v)} className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background">
          Zapisz
        </button>
      </div>
    </ModalShell>
  );
}

function WhenModal({ mode, start, end, flexRange, flexMonth, flexNights, onClose, onSave }: {
  mode: "exact" | "flex"; start: string; end: string; flexRange: number; flexMonth: string; flexNights: number;
  onClose: () => void;
  onSave: (v: { mode: "exact" | "flex"; start: string; end: string; flexRange: number; flexMonth: string; flexNights: number }) => void;
}) {
  const [m, setM] = useState(mode);
  const [s, setS] = useState(start);
  const [e, setE] = useState(end);
  const [fr, setFr] = useState(flexRange);
  const [fm, setFm] = useState(flexMonth);
  const [fn, setFn] = useState(flexNights);
  const months = ["Marzec 2026", "Kwiecień 2026", "Maj 2026", "Czerwiec 2026", "Lipiec 2026", "Sierpień 2026", "Wrzesień 2026"];
  return (
    <ModalShell title="Kiedy lecimy?" subtitle="Dokładny termin lub elastyczne okno" onClose={onClose}>
      <div className="mb-4 flex gap-2 rounded-full bg-muted p-1">
        <button onClick={() => setM("exact")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${m === "exact" ? "bg-background shadow-pop" : "text-muted-foreground"}`}>
          Dokładne daty
        </button>
        <button onClick={() => setM("flex")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${m === "flex" ? "bg-background shadow-pop" : "text-muted-foreground"}`}>
          Elastyczne
        </button>
      </div>
      {m === "exact" ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="rounded-2xl border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Wylot</div>
            <input type="date" value={s} onChange={(ev) => setS(ev.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none" />
          </label>
          <label className="rounded-2xl border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Powrót</div>
            <input type="date" value={e} onChange={(ev) => setE(ev.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none" />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Miesiąc</div>
            <div className="flex flex-wrap gap-1.5">
              {months.map((mo) => (
                <button key={mo} onClick={() => setFm(mo)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${fm === mo ? "bg-brand-blue text-white shadow-pop" : "bg-muted hover:bg-brand-blue-soft"}`}>
                  {mo}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Liczba nocy</span><span className="text-brand-blue">{fn}</span>
            </div>
            <input type="range" min={2} max={21} value={fn} onChange={(ev) => setFn(+ev.target.value)} className="w-full accent-[oklch(0.62_0.20_245)]" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Elastyczność</span><span className="text-brand-green">±{fr} dni</span>
            </div>
            <input type="range" min={0} max={7} value={fr} onChange={(ev) => setFr(+ev.target.value)} className="w-full accent-[oklch(0.70_0.18_155)]" />
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm font-medium">Anuluj</button>
        <button onClick={() => onSave({ mode: m, start: s, end: e, flexRange: fr, flexMonth: fm, flexNights: fn })}
          className="inline-flex items-center gap-1 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background">
          <Check className="h-4 w-4" /> Zapisz
        </button>
      </div>
    </ModalShell>
  );
}
