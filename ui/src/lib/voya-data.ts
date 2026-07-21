export type Vibe = {
  id: string;
  emoji: string;
  label: string;
  tone: "blue" | "green" | "yellow" | "pink" | "neutral";
  category: "mood" | "climate" | "budget" | "stay" | "ai" | "destination" | "flight";
};

export const VIBES: Vibe[] = [
  { id: "party", emoji: "🎉", label: "Imprezowo", tone: "pink", category: "mood" },
  { id: "sun", emoji: "☀️", label: "Dobra pogoda", tone: "yellow", category: "climate" },
  { id: "warm", emoji: "🌡️", label: "Ciepło 25°C+", tone: "yellow", category: "climate" },
  { id: "norain", emoji: "☁️", label: "Bez deszczu", tone: "blue", category: "climate" },
  { id: "snow", emoji: "❄️", label: "Śnieg", tone: "blue", category: "climate" },
  { id: "mountains", emoji: "🏔️", label: "Góry", tone: "green", category: "mood" },
  { id: "culture", emoji: "🏛️", label: "Kultura", tone: "yellow", category: "mood" },
  { id: "active", emoji: "🏄", label: "Aktywnie", tone: "green", category: "mood" },
  { id: "allinclusive", emoji: "🍹", label: "All inclusive", tone: "pink", category: "stay" },
  { id: "hotel", emoji: "🏨", label: "Hotel", tone: "blue", category: "stay" },
  { id: "apartment", emoji: "🏡", label: "Apartament", tone: "green", category: "stay" },
  { id: "resort", emoji: "🌴", label: "Resort", tone: "yellow", category: "stay" },
  { id: "hostel", emoji: "🛏️", label: "Hostel", tone: "green", category: "stay" },
  { id: "glamping", emoji: "⛺", label: "Glamping", tone: "green", category: "stay" },
  { id: "bnb", emoji: "🥞", label: "B&B / pensjonat", tone: "yellow", category: "stay" },
  { id: "boutique", emoji: "🕯️", label: "Butikowy hotel", tone: "pink", category: "stay" },
  { id: "spa", emoji: "💆", label: "Spa & wellness", tone: "pink", category: "stay" },
  { id: "pool", emoji: "🏊", label: "Basen", tone: "blue", category: "stay" },
  { id: "citycenter", emoji: "📍", label: "W centrum miasta", tone: "blue", category: "stay" },
  { id: "breakfast", emoji: "🥐", label: "Śniadanie w cenie", tone: "yellow", category: "stay" },
  { id: "seaview", emoji: "🌊", label: "Blisko plaży", tone: "blue", category: "stay" },
  { id: "freecancel", emoji: "↩️", label: "Darmowe anulowanie", tone: "green", category: "stay" },
  { id: "aircon", emoji: "❄️", label: "Klimatyzacja", tone: "blue", category: "stay" },
  { id: "parking", emoji: "🅿️", label: "Parking", tone: "neutral", category: "stay" },
  { id: "gym", emoji: "🏋️", label: "Siłownia", tone: "green", category: "stay" },
  {
    id: "airporttransfer",
    emoji: "🚐",
    label: "Transfer z lotniska",
    tone: "blue",
    category: "stay",
  },
  { id: "bigcity", emoji: "🏙️", label: "Duże miasto", tone: "blue", category: "destination" },
  { id: "seaside", emoji: "🌊", label: "Nad morzem", tone: "blue", category: "destination" },
  { id: "safe", emoji: "🛡️", label: "Bezpiecznie", tone: "green", category: "destination" },
  { id: "direct", emoji: "✈️", label: "Bez przesiadek", tone: "green", category: "flight" },
  { id: "onestop", emoji: "🔁", label: "Max 1 przesiadka", tone: "blue", category: "flight" },
  { id: "shortflight", emoji: "⏱️", label: "Lot < 4h", tone: "green", category: "flight" },
];

export type Country = { code: string; name: string; airports: { code: string; name: string }[] };

export const DEPARTURE_COUNTRIES: Country[] = [
  {
    code: "PL",
    name: "Polska",
    airports: [
      { code: "WAW", name: "Warszawa Chopin" },
      { code: "WMI", name: "Warszawa Modlin" },
      { code: "KRK", name: "Kraków-Balice" },
      { code: "GDN", name: "Gdańsk-Rębiechowo" },
      { code: "KTW", name: "Katowice-Pyrzowice" },
      { code: "WRO", name: "Wrocław-Strachowice" },
      { code: "POZ", name: "Poznań-Ławica" },
      { code: "RZE", name: "Rzeszów-Jasionka" },
      { code: "SZZ", name: "Szczecin-Goleniów" },
    ],
  },
  {
    code: "DE",
    name: "Niemcy",
    airports: [
      { code: "BER", name: "Berlin-Brandenburg" },
      { code: "MUC", name: "Monachium" },
      { code: "FRA", name: "Frankfurt" },
      { code: "HAM", name: "Hamburg" },
    ],
  },
  { code: "CZ", name: "Czechy", airports: [{ code: "PRG", name: "Praga-Ruzyně" }] },
  { code: "AT", name: "Austria", airports: [{ code: "VIE", name: "Wiedeń-Schwechat" }] },
  {
    code: "UK",
    name: "Wielka Brytania",
    airports: [
      { code: "LHR", name: "Londyn Heathrow" },
      { code: "LGW", name: "Londyn Gatwick" },
      { code: "STN", name: "Londyn Stansted" },
    ],
  },
  { code: "NL", name: "Holandia", airports: [{ code: "AMS", name: "Amsterdam-Schiphol" }] },
  {
    code: "ES",
    name: "Hiszpania",
    airports: [
      { code: "BCN", name: "Barcelona-El Prat" },
      { code: "MAD", name: "Madryt-Barajas" },
      { code: "PMI", name: "Palma de Mallorca" },
    ],
  },
  {
    code: "FR",
    name: "Francja",
    airports: [
      { code: "CDG", name: "Paryż Charles de Gaulle" },
      { code: "ORY", name: "Paryż Orly" },
    ],
  },
  {
    code: "IT",
    name: "Włochy",
    airports: [
      { code: "FCO", name: "Rzym-Fiumicino" },
      { code: "MXP", name: "Mediolan-Malpensa" },
    ],
  },
  { code: "IE", name: "Irlandia", airports: [{ code: "DUB", name: "Dublin" }] },
  {
    code: "PT",
    name: "Portugalia",
    airports: [
      { code: "LIS", name: "Lizbona" },
      { code: "OPO", name: "Porto" },
    ],
  },
];

export const HERO_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1571401835393-8c5f35328320?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1920&q=70",
];

export type SheetSummary = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  dates: string;
  collaborators: number;
  rows: number;
  updated: string;
  vibes: string[];
  cover: string;
  status: "live" | "planning" | "booked";
};

export const DEMO_SHEETS: SheetSummary[] = [
  {
    id: "demo",
    emoji: "🏝️",
    title: "Wakacje ekipy · Czerwiec 2026",
    subtitle: "Warszawa → Południe Europy",
    dates: "12–19 Cze ±3 dni",
    collaborators: 4,
    rows: 6,
    updated: "2 min temu",
    vibes: ["🏊", "🎉", "☀️", "💰", "🏖️"],
    cover:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60",
    status: "live",
  },
  {
    id: "honeymoon",
    emoji: "💞",
    title: "Miesiąc miodowy · Bali & Lombok",
    subtitle: "Warszawa → Indonezja",
    dates: "3–17 Wrz",
    collaborators: 2,
    rows: 4,
    updated: "wczoraj",
    vibes: ["💎", "🧘", "🌴", "🍹"],
    cover:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=60",
    status: "planning",
  },
  {
    id: "family",
    emoji: "👨‍👩‍👧",
    title: "Ferie z dzieciakami · All inclusive",
    subtitle: "Katowice → Egipt / Turcja",
    dates: "14–21 Lut 2027",
    collaborators: 3,
    rows: 8,
    updated: "3 dni temu",
    vibes: ["🍹", "🧒", "🏊", "☀️"],
    cover:
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=800&q=60",
    status: "planning",
  },
  {
    id: "citybreak",
    emoji: "🏛️",
    title: "City break z Anią",
    subtitle: "Warszawa → dowolna stolica",
    dates: "long weekend",
    collaborators: 2,
    rows: 5,
    updated: "tydzień temu",
    vibes: ["🍜", "🏛️", "🌃"],
    cover:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=60",
    status: "booked",
  },
  {
    id: "ski",
    emoji: "🎿",
    title: "Ski trip · Alpy",
    subtitle: "Kraków → Austria/Włochy",
    dates: "Styczeń 2027",
    collaborators: 5,
    rows: 3,
    updated: "2 tyg temu",
    vibes: ["❄️", "🏔️", "💎"],
    cover:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=60",
    status: "planning",
  },
];

export type ResultRow = {
  id: string;
  destination: string;
  flag: string;
  hotel: string;
  hotelStars: number;
  flight: string;
  dates: string;
  price: number;
  currency: string;
  match: number;
  vibes: string[];
  weather: string;
  weatherEmoji: string;
  status: "pending" | "loved" | "maybe" | "no";
  addedBy: string;
};

export const DEMO_RESULTS: ResultRow[] = [
  {
    id: "r1",
    destination: "Lizbona",
    flag: "🇵🇹",
    hotel: "Selina Secret Garden",
    hotelStars: 4,
    flight: "LOT · 3h 40m · direct",
    dates: "12–19 Cze",
    price: 1840,
    currency: "PLN",
    match: 96,
    vibes: ["🎉", "☀️", "🏖️", "🍜"],
    weather: "27°C sunny",
    weatherEmoji: "☀️",
    status: "loved",
    addedBy: "AI",
  },
  {
    id: "r2",
    destination: "Split",
    flag: "🇭🇷",
    hotel: "Hotel Marul + rooftop pool",
    hotelStars: 4,
    flight: "Ryanair · 2h 15m · direct",
    dates: "14–21 Cze",
    price: 1490,
    currency: "PLN",
    match: 92,
    vibes: ["🏊", "🏖️", "☀️", "💰"],
    weather: "26°C sunny",
    weatherEmoji: "☀️",
    status: "maybe",
    addedBy: "AI",
  },
  {
    id: "r3",
    destination: "Palma de Mallorca",
    flag: "🇪🇸",
    hotel: "Nakar Hotel Rooftop",
    hotelStars: 5,
    flight: "Wizz · 3h 20m · direct",
    dates: "12–19 Cze",
    price: 2260,
    currency: "PLN",
    match: 89,
    vibes: ["🏊", "🌃", "🎉", "☀️"],
    weather: "28°C sunny",
    weatherEmoji: "☀️",
    status: "pending",
    addedBy: "AI",
  },
  {
    id: "r4",
    destination: "Kreta — Chania",
    flag: "🇬🇷",
    hotel: "Domes Zeen",
    hotelStars: 5,
    flight: "Aegean · 2h 55m · 1 stop",
    dates: "15–22 Cze",
    price: 2980,
    currency: "PLN",
    match: 87,
    vibes: ["💎", "🏖️", "🧘", "☀️"],
    weather: "29°C sunny",
    weatherEmoji: "☀️",
    status: "loved",
    addedBy: "Anna",
  },
  {
    id: "r5",
    destination: "Walencja",
    flag: "🇪🇸",
    hotel: "Only YOU Hotel",
    hotelStars: 4,
    flight: "Ryanair · 3h 10m · direct",
    dates: "13–20 Cze",
    price: 1660,
    currency: "PLN",
    match: 84,
    vibes: ["🍜", "🏛️", "☀️", "💰"],
    weather: "27°C sunny",
    weatherEmoji: "☀️",
    status: "pending",
    addedBy: "AI",
  },
  {
    id: "r6",
    destination: "Marrakesz",
    flag: "🇲🇦",
    hotel: "Riad BE Marrakech",
    hotelStars: 4,
    flight: "Ryanair · 4h 10m · 1 stop",
    dates: "12–19 Cze",
    price: 1990,
    currency: "PLN",
    match: 78,
    vibes: ["🏛️", "🍜", "☀️"],
    weather: "31°C sunny",
    weatherEmoji: "🌤️",
    status: "no",
    addedBy: "Marek",
  },
];

export type PriceAlert = {
  id: string;
  route: string;
  flag: string;
  threshold: number;
  current: number;
  currency: string;
  channel: ("email" | "push")[];
  active: boolean;
  vibes: string[];
  history: number[];
  change: number;
};

export const DEMO_ALERTS: PriceAlert[] = [
  {
    id: "a1",
    route: "Warszawa → Lizbona",
    flag: "🇵🇹",
    threshold: 1500,
    current: 1840,
    currency: "PLN",
    channel: ["email", "push"],
    active: true,
    vibes: ["🎉", "☀️", "🏖️"],
    history: [2100, 2050, 1980, 2020, 1950, 1890, 1920, 1870, 1900, 1840],
    change: -8,
  },
  {
    id: "a2",
    route: "Warszawa → Tokio",
    flag: "🇯🇵",
    threshold: 3500,
    current: 3320,
    currency: "PLN",
    channel: ["push"],
    active: true,
    vibes: ["🏛️", "🍜", "📸"],
    history: [4200, 4100, 3980, 3900, 3800, 3700, 3600, 3550, 3400, 3320],
    change: -21,
  },
  {
    id: "a3",
    route: "Kraków → Bali",
    flag: "🇮🇩",
    threshold: 3000,
    current: 3450,
    currency: "PLN",
    channel: ["email"],
    active: true,
    vibes: ["🏊", "🧘", "🏖️"],
    history: [3200, 3250, 3300, 3400, 3350, 3300, 3380, 3420, 3450, 3450],
    change: 8,
  },
  {
    id: "a4",
    route: "Warszawa → Reykjavik",
    flag: "🇮🇸",
    threshold: 2000,
    current: 2100,
    currency: "PLN",
    channel: ["email", "push"],
    active: false,
    vibes: ["❄️", "📸"],
    history: [2300, 2250, 2200, 2180, 2150, 2120, 2100, 2080, 2100, 2100],
    change: -9,
  },
];
