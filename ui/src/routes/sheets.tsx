import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/voya/TopBar";
import { CountryFlag } from "@/components/voya/CountryFlag";
import { RequireAuth } from "@/components/voya/RequireAuth";
import { DEMO_SHEETS } from "@/lib/voya-data";
import { vibeIcon } from "@/lib/vibe-icons";

export const Route = createFileRoute("/sheets")({
  component: SheetsList,
  head: () => ({
    meta: [
      { title: "Moje katalogi · Voya" },
      { name: "description", content: "Wszystkie Twoje wspólne katalogi z planami wyjazdów." },
    ],
  }),
});

const statusMeta = {
  live: {
    label: "W toku",
    tone: "bg-brand-green text-white",
  },
  planning: {
    label: "Planowanie",
    tone: "bg-brand-yellow-ink text-white",
  },
  booked: {
    label: "Zarezerwowane",
    tone: "bg-brand-blue text-white",
  },
} as const;

function pluralize(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function SheetsList() {
  return (
    <RequireAuth>
      <SheetsListContent />
    </RequireAuth>
  );
}

function SheetsListContent() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Moje katalogi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Wspólne plany wyjazdów. Kliknij, aby otworzyć i edytować z ekipą.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_SHEETS.map((s) => {
            const meta = statusMeta[s.status];
            const people = pluralize(s.collaborators, "osoba", "osoby", "osób");
            const offers = pluralize(s.rows, "oferta", "oferty", "ofert");
            return (
              <Link
                key={s.id}
                to="/results/$id"
                params={{ id: s.id }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1 hover:shadow-pop"
              >
                <div className="flex items-start justify-between gap-2 px-4 pb-3 pt-3.5">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.tone}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Aktualizacja: {s.updated}
                    </span>
                  </div>
                  <CountryFlag
                    code={s.countryCode}
                    label={s.subtitle}
                    className="mt-0.5 h-6 w-9 shrink-0"
                  />
                </div>

                <div className="relative h-[152px] overflow-hidden">
                  <img
                    src={s.cover}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute inset-x-3.5 bottom-3 min-w-0 text-white">
                    <div className="truncate font-display text-base font-bold leading-tight drop-shadow">
                      {s.title}
                    </div>
                    <div className="truncate text-xs opacity-90 drop-shadow">{s.subtitle}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 px-4 pb-4 pt-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {s.vibes.map((v, i) => {
                      const Icon = vibeIcon(v);
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-muted-foreground"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {v}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{s.dates}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.collaborators} {people} · {s.rows} {offers}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
