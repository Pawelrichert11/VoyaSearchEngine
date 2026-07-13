import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { voyaButtonVariants } from "@/components/voya/style-system";

export function TopBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = [
    { to: "/", label: "Szukaj" },
    { to: "/sheets", label: "Moje katalogi" },
    { to: "/alerts", label: "Alerty" },
    { to: "/guide", label: "Przewodnik" },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-pop">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">voya</span>
          <span className="ml-1 hidden rounded-full bg-brand-yellow-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-yellow-ink sm:inline">
            beta
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active =
              n.to === "/" ? path === "/" : path.startsWith(n.to.split("/").slice(0, 2).join("/"));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  voyaButtonVariants({
                    variant: active ? "primary" : "ghost",
                    size: "md",
                  }),
                  active ? "shadow-none" : "",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/alerts"
            className={cn(voyaButtonVariants({ variant: "outline", size: "icon" }), "relative")}
            aria-label="Alerty"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-green" />
          </Link>
          <Link
            to="/login"
            className={cn(
              voyaButtonVariants({ variant: "primary", size: "md" }),
              "hidden sm:inline-flex",
            )}
          >
            Zaloguj
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green-soft text-sm font-semibold text-brand-green-ink">
            KM
          </div>
        </div>
      </div>
    </header>
  );
}
