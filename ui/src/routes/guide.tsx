import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Clock, Compass, MapPin, Star } from "lucide-react";
import { TopBar } from "@/components/voya/TopBar";
import { CountryFlag } from "@/components/voya/CountryFlag";

export const Route = createFileRoute("/guide")({
  component: GuidePage,
  head: () => ({
    meta: [
      { title: "Przewodnik · Voya" },
      {
        name: "description",
        content: "Przewodnik po miastach z najciekawszymi miejscami do zobaczenia.",
      },
    ],
  }),
});

type GuideCity = {
  id: string;
  city: string;
  country: string;
  flag: string;
  image: string;
  bestFor: string;
  time: string;
  intro: string;
  places: {
    name: string;
    emoji: string;
    kind: string;
    description: string;
    tip: string;
  }[];
  food: {
    name: string;
    emoji: string;
    kind: string;
    note: string;
  }[];
};

const GUIDE_CITIES: GuideCity[] = [
  {
    id: "valencia",
    city: "Walencja",
    country: "Hiszpania",
    flag: "🇪🇸",
    image:
      "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=75",
    bestFor: "plaża, jedzenie, architektura",
    time: "2-4 dni",
    intro:
      "Miasto idealne na lekki city break: futurystyczna architektura, stare centrum i szeroka plaża w jednym planie.",
    places: [
      {
        name: "Ciudad de las Artes y las Ciencias",
        emoji: "🏛️",
        kind: "architektura",
        description:
          "Najbardziej rozpoznawalny kompleks Walencji z muzeami, oceanarium i świetnymi kadrami.",
        tip: "Najlepiej przyjść rano albo przed zachodem słońca.",
      },
      {
        name: "Mercado Central",
        emoji: "🥘",
        kind: "jedzenie",
        description:
          "Hala targowa z lokalnymi produktami, tapasami i szybkim wejściem w klimat miasta.",
        tip: "Idź przed lunchem, kiedy stoiska są pełne.",
      },
      {
        name: "Playa de la Malvarrosa",
        emoji: "🏖️",
        kind: "plaża",
        description: "Długa miejska plaża, dobra na odpoczynek po zwiedzaniu.",
        tip: "Połącz z kolacją przy promenadzie.",
      },
    ],
    food: [
      {
        name: "Casa Carmela",
        emoji: "🥘",
        kind: "paella",
        note: "Klasyczna paella blisko plaży, dobra na konkretny obiad.",
      },
      {
        name: "Central Bar",
        emoji: "🥪",
        kind: "tapas",
        note: "Szybkie kanapki i tapas w Mercado Central.",
      },
      {
        name: "Horchatería Santa Catalina",
        emoji: "🥤",
        kind: "lokalne słodkie",
        note: "Horchata i fartons w bardzo klasycznym miejscu.",
      },
    ],
  },
  {
    id: "lisbon",
    city: "Lizbona",
    country: "Portugalia",
    flag: "🇵🇹",
    image:
      "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=1200&q=75",
    bestFor: "widoki, tramwaje, ocean",
    time: "3-5 dni",
    intro:
      "Pagórkowate miasto z punktami widokowymi, starymi dzielnicami i łatwym wypadem nad Atlantyk.",
    places: [
      {
        name: "Alfama",
        emoji: "🎶",
        kind: "dzielnica",
        description: "Wąskie uliczki, fado i najbardziej klasyczny klimat starej Lizbony.",
        tip: "Zgub się pieszo, ale wracaj tramwajem.",
      },
      {
        name: "Miradouro da Senhora do Monte",
        emoji: "🌅",
        kind: "widok",
        description: "Jeden z najlepszych punktów widokowych na centrum i rzekę Tag.",
        tip: "Weź kawę na wynos i idź przed zachodem.",
      },
      {
        name: "Belém",
        emoji: "🥮",
        kind: "historia",
        description: "Klasztor, wieża i klasyczne pastel de nata w jednej części miasta.",
        tip: "Zarezerwuj więcej czasu, kolejki potrafią być długie.",
      },
    ],
    food: [
      {
        name: "Time Out Market",
        emoji: "🍽️",
        kind: "food hall",
        note: "Wygodny wybór wielu kuchni w jednym miejscu.",
      },
      {
        name: "Manteigaria",
        emoji: "🥮",
        kind: "pastel de nata",
        note: "Szybki klasyk na słodko, najlepiej jeszcze ciepły.",
      },
      {
        name: "Taberna da Rua das Flores",
        emoji: "🍷",
        kind: "portugalskie",
        note: "Mała taberna z lokalnym klimatem i krótkim menu.",
      },
    ],
  },
  {
    id: "split",
    city: "Split",
    country: "Chorwacja",
    flag: "🇭🇷",
    image:
      "https://images.pexels.com/photos/28142401/pexels-photo-28142401.jpeg?auto=compress&cs=tinysrgb&w=1200",
    bestFor: "morze, wyspy, stare miasto",
    time: "3-6 dni",
    intro: "Dobra baza na Dalmację: antyczne centrum, port i szybkie promy na wyspy.",
    places: [
      {
        name: "Pałac Dioklecjana",
        emoji: "🏺",
        kind: "historia",
        description: "Żywe stare miasto zbudowane wewnątrz rzymskiego pałacu.",
        tip: "Najlepszy klimat jest wieczorem po zejściu upału.",
      },
      {
        name: "Wzgórze Marjan",
        emoji: "🌲",
        kind: "spacer",
        description: "Zielony punkt widokowy nad Splitem, dobry na odpoczynek od tłumu.",
        tip: "Weź wodę, podejście jest krótkie, ale w słońcu mocne.",
      },
      {
        name: "Promenada Riva",
        emoji: "☕",
        kind: "relaks",
        description: "Główne miejsce na kawę, spacer i obserwowanie portu.",
        tip: "Siądź na kawę rano, zanim robi się tłoczno.",
      },
    ],
    food: [
      {
        name: "Bokeria Kitchen & Wine",
        emoji: "🍷",
        kind: "dalmatyńskie",
        note: "Dobre miejsce na kolację i wino w centrum.",
      },
      {
        name: "Villa Spiza",
        emoji: "🐟",
        kind: "owoce morza",
        note: "Prosta kuchnia, świeże składniki i luźny klimat.",
      },
      {
        name: "Luka Ice Cream",
        emoji: "🍦",
        kind: "lody",
        note: "Dobry przystanek na deser po spacerze po centrum.",
      },
    ],
  },
  {
    id: "chania",
    city: "Chania",
    country: "Grecja",
    flag: "🇬🇷",
    image:
      "https://images.unsplash.com/photo-1601581875039-e899893d520c?auto=format&fit=crop&w=1200&q=75",
    bestFor: "plaże, port, kuchnia",
    time: "4-7 dni",
    intro:
      "Najładniejsza baza na zachodnią Kretę: wenecki port, świetna kuchnia i plaże na jednodniowe wypady.",
    places: [
      {
        name: "Stary Port Wenecki",
        emoji: "⚓",
        kind: "spacer",
        description:
          "Kolorowy port z latarnią, restauracjami i najbardziej pocztówkowym widokiem Chanii.",
        tip: "Najładniej wygląda o zachodzie słońca.",
      },
      {
        name: "Plaża Balos",
        emoji: "🏝️",
        kind: "plaża",
        description: "Laguna z jasnym piaskiem i turkusową wodą, klasyk zachodniej Krety.",
        tip: "Warto ruszyć wcześnie, zanim dojadą wycieczki.",
      },
      {
        name: "Targ Agora",
        emoji: "🍯",
        kind: "jedzenie",
        description: "Dobre miejsce na oliwę, sery, przyprawy i szybkie lokalne zakupy.",
        tip: "Szukaj lokalnego miodu i oliwy z małych gospodarstw.",
      },
    ],
    food: [
      {
        name: "Tamam Restaurant",
        emoji: "🍲",
        kind: "kreteńskie",
        note: "Kuchnia kreteńska w starym mieście, dobre na kolację.",
      },
      {
        name: "To Maridaki",
        emoji: "🐟",
        kind: "ryby",
        note: "Lekko, lokalnie i dobrze pod owoce morza.",
      },
      {
        name: "Bougatsa Iordanis",
        emoji: "🥐",
        kind: "śniadanie",
        note: "Bougatsa na szybki, lokalny start dnia.",
      },
    ],
  },
  {
    id: "marrakesh",
    city: "Marrakesz",
    country: "Maroko",
    flag: "🇲🇦",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Djemaa_el_Fna.jpg/330px-Djemaa_el_Fna.jpg",
    bestFor: "medyna, riady, kolory",
    time: "3-5 dni",
    intro:
      "Intensywny kierunek na krótki city break: medyna, ogrody, riady i mocne wejście w marokański klimat.",
    places: [
      {
        name: "Jemaa el-Fna",
        emoji: "🕌",
        kind: "plac",
        description: "Główny plac medyny, który najbardziej ożywa po zmroku.",
        tip: "Trzymaj gotówkę drobno i pilnuj tempa spaceru.",
      },
      {
        name: "Jardin Majorelle",
        emoji: "🌿",
        kind: "ogród",
        description: "Kolorowy ogród z mocnym błękitem, palmami i spokojniejszym rytmem.",
        tip: "Kup bilet online, bo kolejki są częste.",
      },
      {
        name: "Pałac Bahia",
        emoji: "✨",
        kind: "architektura",
        description: "Bogate wnętrza, dziedzińce i detale świetne na spokojne zwiedzanie.",
        tip: "Najlepiej wejść rano, kiedy jest mniej grup.",
      },
    ],
    food: [
      {
        name: "Nomad",
        emoji: "🍋",
        kind: "marokańskie",
        note: "Nowoczesne marokańskie jedzenie i taras z widokiem.",
      },
      {
        name: "Le Jardin",
        emoji: "🌿",
        kind: "ogród",
        note: "Spokojniejsza przerwa w zielonym patio medyny.",
      },
      {
        name: "Café des Épices",
        emoji: "☕",
        kind: "kawa i lunch",
        note: "Dobre na przerwę, herbatę miętową i prosty lunch.",
      },
    ],
  },
];

function GuidePage() {
  const [selectedId, setSelectedId] = useState(GUIDE_CITIES[0].id);
  const selected = GUIDE_CITIES.find((city) => city.id === selectedId) ?? GUIDE_CITIES[0];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-blue-soft px-3 py-1 text-xs font-semibold text-brand-blue-ink">
              <Compass className="h-3.5 w-3.5" />
              Przewodnik po miastach
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Co zobaczyć po wybraniu miasta
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Kliknij miasto i zobacz przykładową krótką listę miejsc, które warto dodać do planu
              wyjazdu.
            </p>
          </div>
          <div className="rounded-full bg-brand-yellow-soft px-4 py-2 text-sm font-semibold text-brand-yellow-ink">
            5 miast w prototypie
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="space-y-2">
            {GUIDE_CITIES.map((city) => {
              const active = city.id === selected.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setSelectedId(city.id)}
                  className={`group w-full overflow-hidden rounded-3xl border p-3 text-left transition-colors ${
                    active
                      ? "border-brand-blue bg-brand-blue-soft shadow-soft"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={city.image}
                      alt={city.city}
                      className="h-16 w-20 rounded-2xl object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-display text-lg font-semibold">
                        <CountryFlag flag={city.flag} label={city.country} />
                        <span className="truncate">{city.city}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{city.country}</div>
                      <div className="mt-1 truncate text-xs font-medium text-foreground/70">
                        {city.bestFor}
                      </div>
                    </div>
                    <ArrowRight
                      className={`h-4 w-4 transition-transform ${
                        active ? "translate-x-0 text-brand-blue" : "text-muted-foreground"
                      } group-hover:translate-x-0.5`}
                    />
                  </div>
                </button>
              );
            })}
          </aside>

          <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
            <div className="relative min-h-72">
              <img
                src={selected.image}
                alt={selected.city}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="relative flex min-h-72 flex-col justify-end p-6 text-background">
                <CountryFlag flag={selected.flag} label={selected.country} className="h-9 w-14" />
                <h2 className="mt-2 font-display text-4xl font-bold">{selected.city}</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-background/90 px-3 py-1 text-foreground">
                    {selected.country}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-foreground">
                    <Clock className="h-3 w-3" />
                    {selected.time}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-foreground">
                    <Star className="h-3 w-3" />
                    {selected.bestFor}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{selected.intro}</p>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {selected.places.map((place) => (
                  <article
                    key={place.name}
                    className="rounded-3xl border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-3xl">{place.emoji}</span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {place.kind}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold leading-tight">
                      {place.name}
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">
                      {place.description}
                    </p>
                    <div className="mt-4 rounded-2xl bg-brand-yellow-soft/70 p-3 text-xs font-medium text-brand-yellow-ink">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {place.tip}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-bold">Gdzie zjeść</h3>
                    <p className="text-sm text-muted-foreground">
                      Szybkie typy miejsc do zapisania w planie miasta.
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-green-soft px-3 py-1 text-xs font-semibold text-brand-green-ink">
                    {selected.food.length} miejsca
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {selected.food.map((food) => (
                    <article
                      key={food.name}
                      className="rounded-3xl border border-brand-green/20 bg-brand-green-soft/30 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-3xl">{food.emoji}</span>
                        <span className="rounded-full bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-green-ink">
                          {food.kind}
                        </span>
                      </div>
                      <h4 className="mt-3 font-display text-lg font-semibold leading-tight">
                        {food.name}
                      </h4>
                      <p className="mt-2 text-sm leading-5 text-muted-foreground">{food.note}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
