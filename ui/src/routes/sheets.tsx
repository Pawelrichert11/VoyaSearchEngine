import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { TopBar } from "@/components/voya/TopBar";
import { DEMO_SHEETS } from "@/lib/voya-data";

export const Route = createFileRoute("/sheets")({
  component: SheetsList,
  head: () => ({
    meta: [
      { title: "Moje arkusze · Voya" },
      { name: "description", content: "Wszystkie Twoje wspólne arkusze z planami wyjazdów." },
    ],
  }),
});

const statusMeta = {
  live: {
    label: "na żywo",
    tone: "bg-brand-green-soft text-brand-green-ink",
    dot: "bg-brand-green animate-pulse",
  },
  planning: {
    label: "planowanie",
    tone: "bg-brand-yellow-soft text-brand-yellow-ink",
    dot: "bg-brand-yellow",
  },
  booked: {
    label: "zarezerwowane",
    tone: "bg-brand-blue-soft text-brand-blue-ink",
    dot: "bg-brand-blue",
  },
} as const;

function SheetsList() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Moje arkusze</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Wspólne plany wyjazdów. Kliknij, aby otworzyć i edytować z ekipą.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_SHEETS.map((s) => {
            const meta = statusMeta[s.status];
            return (
              <Link
                key={s.id}
                to="/results/$id"
                params={{ id: s.id }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1 hover:shadow-pop"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={s.cover}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                  <span
                    className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${meta.tone}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                  </span>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-card text-xl shadow-pop">
                      {s.emoji}
                    </span>
                    <div className="text-background">
                      <div className="font-display text-base font-semibold leading-tight drop-shadow">
                        {s.title}
                      </div>
                      <div className="text-[11px] opacity-90">{s.subtitle}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {s.vibes.map((v, i) => (
                      <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {v}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{s.dates}</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {s.collaborators} · {s.rows} ofert
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Aktualizacja: {s.updated}
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
