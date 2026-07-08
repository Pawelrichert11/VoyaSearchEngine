const FLAG_TO_CODE: Record<string, string> = {
  "🇦🇹": "at",
  "🇧🇬": "bg",
  "🇨🇾": "cy",
  "🇨🇿": "cz",
  "🇩🇪": "de",
  "🇪🇸": "es",
  "🇫🇷": "fr",
  "🇬🇧": "gb",
  "🇬🇷": "gr",
  "🇭🇷": "hr",
  "🇮🇩": "id",
  "🇮🇪": "ie",
  "🇮🇸": "is",
  "🇮🇹": "it",
  "🇯🇵": "jp",
  "🇲🇦": "ma",
  "🇳🇱": "nl",
  "🇵🇱": "pl",
  "🇵🇹": "pt",
  "🇹🇷": "tr",
  "🇺🇸": "us",
};

const NAME_TO_CODE: Record<string, string> = {
  Austria: "at",
  Bułgaria: "bg",
  Chorwacja: "hr",
  Cypr: "cy",
  Czechy: "cz",
  Francja: "fr",
  Grecja: "gr",
  Hiszpania: "es",
  Holandia: "nl",
  Indonezja: "id",
  Irlandia: "ie",
  Islandia: "is",
  Japonia: "jp",
  Maroko: "ma",
  Niemcy: "de",
  Polska: "pl",
  Portugalia: "pt",
  Turcja: "tr",
  "Stany Zjednoczone": "us",
  "Wielka Brytania": "gb",
  Włochy: "it",
};

function normalizeCode(code?: string) {
  if (!code) return "";
  const normalized = code.trim().toLowerCase();
  return normalized === "uk" ? "gb" : normalized;
}

function countryCodeFromFlag(flag?: string, label?: string, code?: string) {
  return normalizeCode(code) || FLAG_TO_CODE[flag ?? ""] || NAME_TO_CODE[label ?? ""] || "";
}

export function CountryFlag({
  code,
  flag,
  label,
  className = "h-4 w-6",
}: {
  code?: string;
  flag?: string;
  label?: string;
  className?: string;
}) {
  const resolved = countryCodeFromFlag(flag, label, code);

  if (!resolved) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-[3px] bg-muted text-[10px] ${className}`}
      >
        {flag || "🌍"}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/${resolved}.svg`}
      alt={label ? `Flaga ${label}` : "Flaga kraju"}
      className={`inline-block rounded-[3px] object-cover shadow-sm ring-1 ring-black/10 ${className}`}
      loading="lazy"
    />
  );
}
