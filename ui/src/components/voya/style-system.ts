import { cva } from "class-variance-authority";

export const voya = {
  page: "min-h-screen bg-background",
  container: "mx-auto max-w-7xl px-4 sm:px-6",
  heroCard:
    "rounded-xl border border-border/70 bg-card/55 p-3 shadow-pop backdrop-blur-xl backdrop-saturate-150 sm:p-4",
  surface: "rounded-xl border border-border bg-card shadow-soft",
  surfacePop: "rounded-lg border border-border bg-card shadow-pop",
  dropdown:
    "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-lg border border-border bg-card px-4 py-3 shadow-pop",
  toolbar: "flex flex-wrap items-center gap-2",
  eyebrow: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
  mutedText: "text-sm text-muted-foreground",
  chipLabel: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
  field:
    "group flex items-center gap-3 rounded-lg bg-background px-4 py-3 text-left transition-colors hover:bg-muted",
  iconBox: "flex h-9 w-9 items-center justify-center rounded-md bg-muted group-hover:bg-background",
};

export const voyaButtonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-brand-blue text-white shadow-pop hover:brightness-105",
        soft: "bg-muted text-foreground hover:bg-muted/70",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        blue: "border border-brand-blue/40 bg-brand-blue-soft text-brand-blue-ink hover:brightness-105",
        green:
          "border border-brand-green/40 bg-brand-green-soft text-brand-green-ink hover:brightness-105",
        danger: "bg-brand-pink-soft text-foreground hover:brightness-105",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-3.5 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        iconSm: "h-8 w-8 p-0 text-sm",
        icon: "h-9 w-9 p-0 text-sm",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "sm",
    },
  },
);

export const voyaSegmentVariants = cva(
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60",
  {
    variants: {
      active: {
        true: "bg-brand-blue text-white shadow-soft",
        false: "bg-muted text-foreground hover:bg-muted/70",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export const tonePillClasses = {
  blue: {
    active:
      "border-brand-blue-ink bg-brand-blue text-white ring-2 ring-brand-blue/40 ring-offset-2 ring-offset-background shadow-pop",
    idle: "border-brand-blue-soft bg-brand-blue-soft text-brand-blue-ink hover:brightness-105",
  },
  green: {
    active:
      "border-brand-green-ink bg-brand-green text-white ring-2 ring-brand-green/40 ring-offset-2 ring-offset-background shadow-pop",
    idle: "border-brand-green-soft bg-brand-green-soft text-brand-green-ink hover:brightness-105",
  },
  yellow: {
    active:
      "border-brand-yellow-ink bg-brand-yellow text-brand-yellow-ink ring-2 ring-brand-yellow/60 ring-offset-2 ring-offset-background shadow-pop",
    idle: "border-brand-yellow-soft bg-brand-yellow-soft text-brand-yellow-ink hover:brightness-105",
  },
  pink: {
    active:
      "border-brand-pink bg-brand-pink text-white ring-2 ring-brand-pink/40 ring-offset-2 ring-offset-background shadow-pop",
    idle: "border-brand-pink-soft bg-brand-pink-soft text-foreground hover:brightness-105",
  },
  neutral: {
    active:
      "border-foreground bg-foreground text-background ring-2 ring-foreground/30 ring-offset-2 ring-offset-background shadow-pop",
    idle: "border-border bg-background text-foreground hover:bg-muted",
  },
} as const;
