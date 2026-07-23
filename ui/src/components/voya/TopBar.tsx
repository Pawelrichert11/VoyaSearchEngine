import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Check, Globe2, LogOut, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { voyaButtonVariants } from "@/components/voya/style-system";
import { authClient } from "@/lib/auth/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopBar() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [locale, setLocale] = useState<"pl" | "en">("pl");
  const [languageOpen, setLanguageOpen] = useState(false);
  const copy = locale === "pl" ? TOPBAR_COPY.pl : TOPBAR_COPY.en;

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("voya-language");
    const nextLocale = savedLocale === "en" ? "en" : "pl";
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }, []);

  useEffect(() => {
    if (!languageOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLanguageOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [languageOpen]);

  const selectLocale = (nextLocale: "pl" | "en") => {
    setLocale(nextLocale);
    window.localStorage.setItem("voya-language", nextLocale);
    document.documentElement.lang = nextLocale;
    setLanguageOpen(false);
  };

  const nav = [
    { to: "/", label: copy.search },
    { to: "/sheets", label: copy.catalogs, requiresAuth: true },
    { to: "/alerts", label: copy.alerts, requiresAuth: true },
    { to: "/guide", label: copy.guide },
  ].filter((item) => !item.requiresAuth || session);

  return (
    <header className="sticky top-0 z-30 border-b border-border/25 bg-background/35 backdrop-blur-xl supports-[backdrop-filter]:bg-background/25">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white shadow-pop">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">voya</span>
          <span className="ml-1 hidden rounded-full bg-brand-yellow-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-yellow-ink sm:inline">
            beta
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={copy.mainNavigation}>
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? path === "/"
                : path.startsWith(item.to.split("/").slice(0, 2).join("/"));

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  voyaButtonVariants({
                    variant: active ? "primary" : "ghost",
                    size: "md",
                  }),
                  active ? "shadow-none" : "",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguageOpen(true)}
            className={cn(voyaButtonVariants({ variant: "primary", size: "sm" }))}
            aria-label={copy.changeLanguage}
          >
            <Globe2 className="h-4 w-4" />
            {locale.toUpperCase()}
          </button>

          {session && (
            <Link
              to="/alerts"
              className={cn(voyaButtonVariants({ variant: "outline", size: "icon" }), "relative")}
              aria-label={copy.alerts}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-green" />
            </Link>
          )}

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-green-soft text-sm font-semibold text-brand-green-ink outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={copy.account}
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initials(session.user.name)
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="truncate font-semibold">{session.user.name}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {session.user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await authClient.signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {copy.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className={cn(
                voyaButtonVariants({ variant: "primary", size: "md" }),
                "hidden sm:inline-flex",
              )}
            >
              {copy.signIn}
            </Link>
          )}
        </div>
      </div>

      {languageOpen && (
        <LanguageModal
          locale={locale}
          copy={copy}
          onClose={() => setLanguageOpen(false)}
          onSelect={selectLocale}
        />
      )}
    </header>
  );
}

const TOPBAR_COPY = {
  pl: {
    search: "Szukaj",
    catalogs: "Moje katalogi",
    alerts: "Alerty",
    guide: "Przewodnik",
    account: "Konto",
    signIn: "Zaloguj",
    signOut: "Wyloguj się",
    mainNavigation: "Główna nawigacja",
    changeLanguage: "Zmień język",
    languageTitle: "Język interfejsu",
    languageDescription: "Wybierz język używany przez Voya.",
    polish: "Polski",
    english: "Angielski",
    close: "Zamknij wybór języka",
  },
  en: {
    search: "Search",
    catalogs: "My catalogs",
    alerts: "Alerts",
    guide: "Guide",
    account: "Account",
    signIn: "Sign in",
    signOut: "Sign out",
    mainNavigation: "Main navigation",
    changeLanguage: "Change language",
    languageTitle: "Interface language",
    languageDescription: "Choose the language used by Voya.",
    polish: "Polish",
    english: "English",
    close: "Close language selector",
  },
} as const;

function LanguageModal({
  locale,
  copy,
  onClose,
  onSelect,
}: {
  locale: "pl" | "en";
  copy: (typeof TOPBAR_COPY)["pl"] | (typeof TOPBAR_COPY)["en"];
  onClose: () => void;
  onSelect: (locale: "pl" | "en") => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-foreground/25 px-4 pt-24 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-modal-title"
        className="w-full max-w-sm rounded-xl border border-border/80 bg-card/95 p-5 shadow-pop"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="language-modal-title" className="font-display text-lg font-semibold">
              {copy.languageTitle}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{copy.languageDescription}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
            aria-label={copy.close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <LanguageOption
            code="PL"
            label={copy.polish}
            active={locale === "pl"}
            tone="yellow"
            onClick={() => onSelect("pl")}
          />
          <LanguageOption
            code="EN"
            label={copy.english}
            active={locale === "en"}
            tone="blue"
            onClick={() => onSelect("en")}
          />
        </div>
      </div>
    </div>
  );
}

function LanguageOption({
  code,
  label,
  active,
  tone,
  onClick,
}: {
  code: string;
  label: string;
  active: boolean;
  tone: "yellow" | "blue";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
        active
          ? tone === "yellow"
            ? "border-brand-yellow bg-brand-yellow-soft text-brand-yellow-ink"
            : "border-brand-blue bg-brand-blue-soft text-brand-blue-ink"
          : "border-border bg-background hover:bg-muted",
      )}
    >
      <span className="text-xs font-bold tracking-wider">{code}</span>
      <span className="min-w-0 flex-1 text-sm font-semibold">{label}</span>
      {active && <Check className="h-4 w-4 shrink-0" />}
    </button>
  );
}
