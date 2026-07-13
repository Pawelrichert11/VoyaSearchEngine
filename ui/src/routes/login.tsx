import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";
import { RotatingHero } from "@/components/voya/RotatingHero";
import { voyaSegmentVariants } from "@/components/voya/style-system";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Zaloguj się · Voya" },
      {
        name: "description",
        content:
          "Zaloguj się do Voya, aby wrócić do swoich katalogów, alertów cenowych i zapisanych ofert.",
      },
    ],
  }),
});

type Mode = "login" | "signup";

const copy = {
  login: {
    heading: "Zaloguj się do Voya",
    sub: "Wróć do swoich katalogów, alertów cenowych i zapisanych ofert.",
    submit: "Zaloguj się",
    google: "Kontynuuj z Google",
    footerPrompt: "Nie masz jeszcze konta?",
    footerAction: "Zarejestruj się",
  },
  signup: {
    heading: "Załóż konto Voya",
    sub: "Zapisuj oferty, twórz katalogi i udostępniaj je ekipie.",
    submit: "Utwórz konto",
    google: "Zarejestruj przez Google",
    footerPrompt: "Masz już konto?",
    footerAction: "Zaloguj się",
  },
} as const;

function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";
  const t = copy[mode];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: wire up to auth backend
    console.log({ mode, name, email, password, remember });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <RotatingHero />

      {/* Brand mark */}
      <Link
        to="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-2"
        aria-label="Voya — strona główna"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-pop">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-bold tracking-tight text-white drop-shadow">
          voya
        </span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          beta
        </span>
      </Link>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-24">
        <div className="w-full max-w-[26rem] rounded-[1.75rem] border border-white/70 bg-card/95 p-9 shadow-pop backdrop-blur">
          {/* Header */}
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-pop">
              <Sparkles className="h-6 w-6" />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {t.heading}
            </h1>
            <p className="mt-2 max-w-[19rem] text-sm leading-snug text-muted-foreground">{t.sub}</p>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex gap-1 rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn(voyaSegmentVariants({ active: isLogin }), "flex-1")}
            >
              Logowanie
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cn(voyaSegmentVariants({ active: !isLogin }), "flex-1")}
            >
              Rejestracja
            </button>
          </div>

          {/* Google */}
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <GoogleIcon />
            {t.google}
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3.5">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">lub e-mailem</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {!isLogin && (
              <Field>
                <User className="h-[1.05rem] w-[1.05rem] shrink-0 text-brand-pink" />
                <input
                  type="text"
                  placeholder="Imię"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </Field>
            )}

            <Field>
              <Mail className="h-[1.05rem] w-[1.05rem] shrink-0 text-brand-blue" />
              <input
                type="email"
                placeholder="ty@przyklad.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </Field>

            <Field>
              <Lock className="h-[1.05rem] w-[1.05rem] shrink-0 text-brand-green" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="flex text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              >
                {showPassword ? (
                  <EyeOff className="h-[1.15rem] w-[1.15rem]" />
                ) : (
                  <Eye className="h-[1.15rem] w-[1.15rem]" />
                )}
              </button>
            </Field>

            <div className="mt-0.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRemember((r) => !r)}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors",
                    remember
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-border bg-card",
                  )}
                >
                  {remember && <Check className="h-3 w-3" strokeWidth={3.5} />}
                </span>
                Zapamiętaj mnie
              </button>
              <a
                href="#"
                className="text-sm font-semibold text-brand-blue-ink hover:text-brand-blue"
              >
                Nie pamiętasz hasła?
              </a>
            </div>

            <button
              type="submit"
              className="mt-1.5 h-12 w-full rounded-full bg-foreground font-display text-[0.95rem] font-semibold text-background shadow-pop transition hover:brightness-110"
            >
              {t.submit}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {t.footerPrompt}{" "}
            <button
              type="button"
              onClick={() => setMode(isLogin ? "signup" : "login")}
              className="font-semibold text-brand-blue-ink hover:text-brand-blue"
            >
              {t.footerAction}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-background px-3.5 py-3 transition-colors focus-within:border-brand-blue">
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
