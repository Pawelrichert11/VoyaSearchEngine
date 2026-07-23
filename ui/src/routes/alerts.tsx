import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Mail, Plus, Smartphone, TrendingDown, TrendingUp, X } from "lucide-react";
import { CountryFlag } from "@/components/voya/CountryFlag";
import { TopBar } from "@/components/voya/TopBar";
import { RequireAuth } from "@/components/voya/RequireAuth";
import { DEMO_ALERTS, type PriceAlert } from "@/lib/voya-data";
import { vibeIcon } from "@/lib/vibe-icons";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({
    meta: [
      { title: "Alerty cenowe · Voya" },
      {
        name: "description",
        content:
          "Śledź ceny lotów i hoteli. Otrzymuj powiadomienia gdy cena spadnie poniżej progu.",
      },
    ],
  }),
});

function AlertsPage() {
  return (
    <RequireAuth>
      <AlertsPageContent />
    </RequireAuth>
  );
}

function AlertsPageContent() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(DEMO_ALERTS);
  const [open, setOpen] = useState(false);

  const toggle = (id: string) =>
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow-soft px-3 py-1 text-xs font-semibold text-brand-yellow-ink">
              <Bell className="h-3 w-3" /> {alerts.filter((a) => a.active).length} aktywnych
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Twoje alerty cenowe
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Powiadomimy Cię gdy cena lotu spadnie poniżej progu — email lub push.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-pop transition hover:brightness-105"
          >
            <Plus className="h-4 w-4" /> Nowy alert
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {alerts.map((a) => (
            <AlertCard key={a.id} a={a} onToggle={() => toggle(a.id)} />
          ))}
        </div>
      </div>

      {open && <CreateAlertModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function AlertCard({ a, onToggle }: { a: PriceAlert; onToggle: () => void }) {
  const below = a.current <= a.threshold;
  const dropped = a.change < 0;
  return (
    <div
      className={`rounded-3xl border p-5 transition-opacity ${a.active ? "border-border bg-card" : "border-border bg-muted/50 opacity-70"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CountryFlag flag={a.flag} label={a.route} className="h-8 w-12 shrink-0" />
          <div>
            <div className="font-display text-lg font-semibold">{a.route}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {a.vibes.map((v, i) => {
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
          </div>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" checked={a.active} onChange={onToggle} className="peer sr-only" />
          <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-background after:shadow after:transition-all peer-checked:bg-brand-green peer-checked:after:translate-x-5" />
        </label>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Cena teraz</div>
          <div
            className={`font-display text-3xl font-bold ${below ? "text-brand-green" : "text-foreground"}`}
          >
            {a.current}{" "}
            <span className="text-base font-medium text-muted-foreground">{a.currency}</span>
          </div>
          <div
            className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${dropped ? "text-brand-green" : "text-brand-pink"}`}
          >
            {dropped ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {a.change > 0 ? "+" : ""}
            {a.change}% / 30 dni
          </div>
        </div>
        <Sparkline
          data={a.history}
          threshold={a.threshold}
          min={Math.min(...a.history) * 0.95}
          max={Math.max(...a.history) * 1.05}
        />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/60 p-3 text-xs">
        <div>
          <div className="text-muted-foreground">Powiadom gdy poniżej</div>
          <div className="font-semibold">
            {a.threshold} {a.currency}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {a.channel.includes("email") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue-soft px-2 py-1 text-brand-blue-ink">
              <Mail className="h-3 w-3" /> email
            </span>
          )}
          {a.channel.includes("push") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-green-soft px-2 py-1 text-brand-green-ink">
              <Smartphone className="h-3 w-3" /> push
            </span>
          )}
        </div>
      </div>

      {below && a.active && (
        <div className="mt-3 rounded-2xl bg-brand-green-soft p-3 text-xs font-medium text-brand-green-ink">
          🎉 Cena osiągnęła Twój próg — czas rezerwować!
        </div>
      )}
    </div>
  );
}

function Sparkline({
  data,
  threshold,
  min,
  max,
}: {
  data: number[];
  threshold: number;
  min: number;
  max: number;
}) {
  const W = 160,
    H = 60;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / (max - min)) * H;
      return `${x},${y}`;
    })
    .join(" ");
  const ty = H - ((threshold - min) / (max - min)) * H;
  const lastY = H - ((data[data.length - 1] - min) / (max - min)) * H;
  const lastX = W;
  return (
    <svg width={W} height={H} className="shrink-0">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.20 245)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.62 0.20 245)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${H} ${points} ${W},${H}`} fill="url(#grad)" />
      <polyline
        points={points}
        fill="none"
        stroke="oklch(0.62 0.20 245)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="0"
        x2={W}
        y1={ty}
        y2={ty}
        stroke="oklch(0.70 0.18 155)"
        strokeDasharray="3 3"
        strokeWidth="1.5"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r="3.5"
        fill="oklch(0.62 0.20 245)"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}

function CreateAlertModal({ onClose }: { onClose: () => void }) {
  const [threshold, setThreshold] = useState(1500);
  const [ch, setCh] = useState<{ email: boolean; push: boolean }>({ email: true, push: true });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-pop">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-yellow text-xl text-brand-yellow-ink">
              🔔
            </span>
            <div>
              <div className="font-display text-lg font-semibold">Nowy alert cenowy</div>
              <div className="text-xs text-muted-foreground">Powiadomimy Cię gdy cena spadnie</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <ModalField label="Skąd" value="Warszawa" />
          <ModalField label="Dokąd" value="Barcelona" />
          <ModalField label="Kiedy" value="Sierpień, elast." />
          <ModalField label="Kto" value="2 osoby" />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Próg ceny</span>
            <span className="text-foreground">{threshold} zł</span>
          </div>
          <input
            type="range"
            min={500}
            max={4000}
            step={50}
            value={threshold}
            onChange={(e) => setThreshold(+e.target.value)}
            className="w-full accent-[oklch(0.62_0.20_245)]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>500 zł</span>
            <span>4000 zł</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Powiadamiaj przez
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["email", "push"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setCh((c) => ({ ...c, [k]: !c[k] }))}
                className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-sm ${ch[k] ? "border-brand-blue bg-brand-blue-soft/40" : "border-border"}`}
              >
                {k === "email" ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                <span className="capitalize">{k}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm">
            Anuluj
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Utwórz alert
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
