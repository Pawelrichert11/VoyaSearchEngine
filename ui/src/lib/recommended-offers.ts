export type RecommendedAmenity =
  "air-conditioning" | "all-inclusive" | "breakfast" | "parking" | "pool" | "spa" | "wifi";

export type RecommendedOffer = {
  id: string;
  detailId: string;
  hotel: string;
  hotelStars: number;
  destination: string;
  country: string;
  countryCode: string;
  departure: string;
  dates: string;
  nights: number;
  flight: string;
  price: number;
  images: readonly string[];
  amenities: readonly RecommendedAmenity[];
};

type DestinationSpec = {
  city: string;
  country: string;
  countryCode: string;
  basePrice: number;
  duration: string;
  airlines: readonly [string, string];
  hotels: readonly [string, string];
  connection?: "bezpośredni" | "1 przesiadka";
};

const HOTEL_IMAGES = [
  "/images/hotels/only-you-valencia.jpg",
  "/images/hotels/selina-lisbon.jpg",
  "/images/hotels/hotel-marul-split.jpg",
  "/images/hotels/domes-zeen-crete.jpg",
  "/images/hotels/unsplash-pool-palms.jpg",
  "/images/hotels/unsplash-resort-pool.jpg",
  "/images/hotels/unsplash-pool-terrace.jpg",
  "/images/hotels/unsplash-tropical-resort.jpg",
  "/images/hotels/unsplash-coastal-pool.jpg",
  "/images/hotels/unsplash-sunset-resort.jpg",
  "/images/hotels/unsplash-courtyard-pool.jpg",
  "/images/hotels/unsplash-lagoon-resort.jpg",
  "/images/hotels/unsplash-beach-hotel.jpg",
  "/images/hotels/unsplash-modern-pool.jpg",
  "/images/hotels/unsplash-grand-hotel.jpg",
  "/images/hotels/unsplash-boutique-room.jpg",
  "/images/hotels/unsplash-minimal-room.jpg",
  "/images/hotels/unsplash-hotel-lobby.jpg",
  "/images/hotels/unsplash-hotel-suite.jpg",
  "/images/hotels/unsplash-room-velvet.jpg",
  "/images/hotels/unsplash-room-ocean.jpg",
  "/images/hotels/unsplash-room-city.jpg",
  "/images/hotels/unsplash-room-warm.jpg",
  "/images/hotels/unsplash-room-balcony.jpg",
  "/images/hotels/unsplash-gallery-restaurant-01.jpg",
  "/images/hotels/unsplash-gallery-restaurant-02.jpg",
  "/images/hotels/unsplash-gallery-restaurant-03.jpg",
  "/images/hotels/unsplash-gallery-restaurant-04.jpg",
  "/images/hotels/unsplash-gallery-restaurant-05.jpg",
  "/images/hotels/unsplash-gallery-restaurant-06.jpg",
  "/images/hotels/unsplash-gallery-restaurant-07.jpg",
  "/images/hotels/unsplash-gallery-restaurant-08.jpg",
  "/images/hotels/unsplash-gallery-balcony-01.jpg",
  "/images/hotels/unsplash-gallery-balcony-02.jpg",
  "/images/hotels/unsplash-gallery-balcony-03.jpg",
  "/images/hotels/unsplash-gallery-spa-02.jpg",
] as const;

const AMENITY_SETS: readonly (readonly RecommendedAmenity[])[] = [
  ["air-conditioning", "breakfast", "wifi"],
  ["all-inclusive", "pool", "air-conditioning", "wifi"],
  ["breakfast", "spa", "parking"],
  ["pool", "air-conditioning", "breakfast"],
  ["all-inclusive", "spa", "pool", "wifi"],
  ["parking", "air-conditioning", "wifi"],
  ["breakfast", "pool", "spa", "parking"],
  ["all-inclusive", "air-conditioning", "pool"],
] as const;

const TRAVEL_WINDOWS = [
  { dates: "8–15 sie", nights: 7 },
  { dates: "12–18 sie", nights: 6 },
  { dates: "19–26 sie", nights: 7 },
  { dates: "24 sie–1 wrz", nights: 8 },
  { dates: "3–10 wrz", nights: 7 },
  { dates: "8–13 wrz", nights: 5 },
  { dates: "14–22 wrz", nights: 8 },
  { dates: "20–27 wrz", nights: 7 },
  { dates: "2–9 paź", nights: 7 },
  { dates: "9–15 paź", nights: 6 },
  { dates: "17–24 paź", nights: 7 },
  { dates: "25 paź–2 lis", nights: 8 },
] as const;

const DEPARTURES = [
  "Warszawa Chopin",
  "Kraków Balice",
  "Katowice Pyrzowice",
  "Gdańsk Rębiechowo",
  "Wrocław Strachowice",
] as const;

const DESTINATIONS: DestinationSpec[] = [
  {
    city: "Lizbona",
    country: "Portugalia",
    countryCode: "pt",
    basePrice: 1720,
    duration: "3h 55m",
    airlines: ["LOT", "TAP Air Portugal"],
    hotels: ["Casa do Tejo", "Alfama Garden Hotel"],
  },
  {
    city: "Porto",
    country: "Portugalia",
    countryCode: "pt",
    basePrice: 1590,
    duration: "3h 45m",
    airlines: ["Ryanair", "TAP Air Portugal"],
    hotels: ["Ribeira Light Hotel", "Cedofeita Boutique Stay"],
  },
  {
    city: "Madera",
    country: "Portugalia",
    countryCode: "pt",
    basePrice: 2290,
    duration: "5h 20m",
    airlines: ["Wizz Air", "TAP Air Portugal"],
    hotels: ["Funchal Atlantic Resort", "Cliffside Madeira Suites"],
  },
  {
    city: "Walencja",
    country: "Hiszpania",
    countryCode: "es",
    basePrice: 1480,
    duration: "3h 15m",
    airlines: ["Ryanair", "Wizz Air"],
    hotels: ["Jardín Valencia", "Mercado Central Rooms"],
  },
  {
    city: "Barcelona",
    country: "Hiszpania",
    countryCode: "es",
    basePrice: 1890,
    duration: "3h 05m",
    airlines: ["LOT", "Wizz Air"],
    hotels: ["Eixample Terrace Hotel", "Casa Gràcia Azul"],
  },
  {
    city: "Palma de Mallorca",
    country: "Hiszpania",
    countryCode: "es",
    basePrice: 2060,
    duration: "3h 10m",
    airlines: ["Ryanair", "Enter Air"],
    hotels: ["Palma Bay House", "Can Marés Boutique"],
  },
  {
    city: "Teneryfa",
    country: "Hiszpania",
    countryCode: "es",
    basePrice: 2550,
    duration: "5h 50m",
    airlines: ["Wizz Air", "Smartwings"],
    hotels: ["Costa Adeje Retreat", "Teide Ocean Club"],
  },
  {
    city: "Malaga",
    country: "Hiszpania",
    countryCode: "es",
    basePrice: 1830,
    duration: "3h 45m",
    airlines: ["Ryanair", "Wizz Air"],
    hotels: ["Málaga Sol Hotel", "Alcazaba Rooftop Rooms"],
  },
  {
    city: "Rzym",
    country: "Włochy",
    countryCode: "it",
    basePrice: 1640,
    duration: "2h 15m",
    airlines: ["LOT", "Wizz Air"],
    hotels: ["Trastevere Garden", "Roma Aurelia House"],
  },
  {
    city: "Neapol",
    country: "Włochy",
    countryCode: "it",
    basePrice: 1530,
    duration: "2h 25m",
    airlines: ["Ryanair", "Wizz Air"],
    hotels: ["Vesuvio Terrace Hotel", "Santa Lucia Rooms"],
  },
  {
    city: "Palermo",
    country: "Włochy",
    countryCode: "it",
    basePrice: 1760,
    duration: "2h 45m",
    airlines: ["Ryanair", "ITA Airways"],
    hotels: ["Palermo Citrus House", "Teatro Massimo Suites"],
  },
  {
    city: "Cagliari",
    country: "Włochy",
    countryCode: "it",
    basePrice: 1940,
    duration: "2h 40m",
    airlines: ["Ryanair", "LOT"],
    hotels: ["Sardegna Marina Hotel", "Poetto Beach Rooms"],
  },
  {
    city: "Split",
    country: "Chorwacja",
    countryCode: "hr",
    basePrice: 1470,
    duration: "2h 05m",
    airlines: ["Ryanair", "LOT"],
    hotels: ["Marjan Bay Hotel", "Diocletian Courtyard"],
  },
  {
    city: "Dubrownik",
    country: "Chorwacja",
    countryCode: "hr",
    basePrice: 2070,
    duration: "2h 10m",
    airlines: ["LOT", "Ryanair"],
    hotels: ["Adriatic Walls Hotel", "Lapad Sunset Suites"],
  },
  {
    city: "Zadar",
    country: "Chorwacja",
    countryCode: "hr",
    basePrice: 1390,
    duration: "1h 55m",
    airlines: ["Ryanair", "Buzz"],
    hotels: ["Forum Boutique Zadar", "Sea Organ Residence"],
  },
  {
    city: "Hvar",
    country: "Chorwacja",
    countryCode: "hr",
    basePrice: 2380,
    duration: "2h 05m",
    airlines: ["LOT", "Ryanair"],
    hotels: ["Hvar Lavender Hotel", "Pakleni View Resort"],
  },
  {
    city: "Chania",
    country: "Grecja",
    countryCode: "gr",
    basePrice: 2140,
    duration: "2h 50m",
    airlines: ["Aegean", "Ryanair"],
    hotels: ["Chania Olive Grove", "Venetian Harbour Suites"],
  },
  {
    city: "Santorini",
    country: "Grecja",
    countryCode: "gr",
    basePrice: 3180,
    duration: "3h 00m",
    airlines: ["Aegean", "LOT"],
    hotels: ["Caldera White House", "Oia Horizon Suites"],
  },
  {
    city: "Rodos",
    country: "Grecja",
    countryCode: "gr",
    basePrice: 1990,
    duration: "2h 55m",
    airlines: ["Ryanair", "Enter Air"],
    hotels: ["Rhodes Pine Retreat", "Lindos Stone Hotel"],
  },
  {
    city: "Korfu",
    country: "Grecja",
    countryCode: "gr",
    basePrice: 2050,
    duration: "2h 30m",
    airlines: ["Ryanair", "Wizz Air"],
    hotels: ["Corfu Green Bay", "Ionian Pearl Rooms"],
  },
  {
    city: "Antalya",
    country: "Turcja",
    countryCode: "tr",
    basePrice: 2420,
    duration: "3h 05m",
    airlines: ["SunExpress", "Corendon"],
    hotels: ["Lara Palm Resort", "Antalya Blue Courtyard"],
  },
  {
    city: "Bodrum",
    country: "Turcja",
    countryCode: "tr",
    basePrice: 2590,
    duration: "3h 20m",
    airlines: ["Turkish Airlines", "Pegasus"],
    hotels: ["Bodrum White Bay", "Aegean Fig Hotel"],
    connection: "1 przesiadka",
  },
  {
    city: "Marrakesz",
    country: "Maroko",
    countryCode: "ma",
    basePrice: 1890,
    duration: "4h 25m",
    airlines: ["Ryanair", "Wizz Air"],
    hotels: ["Riad Saffron", "Medina Courtyard House"],
  },
  {
    city: "Agadir",
    country: "Maroko",
    countryCode: "ma",
    basePrice: 2180,
    duration: "4h 35m",
    airlines: ["Ryanair", "LOT"],
    hotels: ["Agadir Dune Resort", "Taghazout Wave Hotel"],
  },
  {
    city: "Nicea",
    country: "Francja",
    countryCode: "fr",
    basePrice: 2090,
    duration: "2h 25m",
    airlines: ["LOT", "Wizz Air"],
    hotels: ["Promenade Azure Hotel", "Vieux Nice Residence"],
  },
  {
    city: "Marsylia",
    country: "Francja",
    countryCode: "fr",
    basePrice: 1980,
    duration: "2h 35m",
    airlines: ["Ryanair", "Lufthansa"],
    hotels: ["Vieux-Port Garden", "Calanques City Hotel"],
  },
  {
    city: "Valletta",
    country: "Malta",
    countryCode: "mt",
    basePrice: 1860,
    duration: "2h 45m",
    airlines: ["Ryanair", "Wizz Air"],
    hotels: ["Valletta Limestone House", "Grand Harbour Rooms"],
  },
  {
    city: "Pafos",
    country: "Cypr",
    countryCode: "cy",
    basePrice: 2240,
    duration: "3h 20m",
    airlines: ["Ryanair", "Wizz Air"],
    hotels: ["Paphos Fig Tree Resort", "Coral Bay Terrace"],
  },
  {
    city: "Saranda",
    country: "Albania",
    countryCode: "al",
    basePrice: 1690,
    duration: "2h 15m",
    airlines: ["Wizz Air", "LOT"],
    hotels: ["Saranda White Coast", "Butrint View Hotel"],
  },
  {
    city: "Kotor",
    country: "Czarnogóra",
    countryCode: "me",
    basePrice: 1810,
    duration: "2h 05m",
    airlines: ["LOT", "Air Serbia"],
    hotels: ["Kotor Bay Stone House", "Perast Waterfront Hotel"],
  },
  {
    city: "Bali",
    country: "Indonezja",
    countryCode: "id",
    basePrice: 4890,
    duration: "16h 40m",
    airlines: ["Qatar Airways", "Emirates"],
    hotels: ["Ubud Ricefield Retreat", "Canggu Palm Suites"],
    connection: "1 przesiadka",
  },
  {
    city: "Tokio",
    country: "Japonia",
    countryCode: "jp",
    basePrice: 5290,
    duration: "15h 20m",
    airlines: ["LOT", "Finnair"],
    hotels: ["Shibuya Lantern Hotel", "Asakusa Garden Rooms"],
    connection: "1 przesiadka",
  },
];

export const RECOMMENDED_OFFERS: RecommendedOffer[] = DESTINATIONS.flatMap(
  (destination, destinationIndex) =>
    destination.hotels.map((hotel, hotelIndex) => {
      const sequence = destinationIndex * destination.hotels.length + hotelIndex;
      const window = TRAVEL_WINDOWS[sequence % TRAVEL_WINDOWS.length];
      const gallerySize = 3 + (sequence % 2);
      const images = Array.from(
        { length: gallerySize },
        (_, imageIndex) => HOTEL_IMAGES[(sequence * 3 + imageIndex * 7) % HOTEL_IMAGES.length],
      );

      return {
        id: `recommended-${String(sequence + 1).padStart(2, "0")}`,
        detailId: `r${(sequence % 6) + 1}`,
        hotel,
        hotelStars: Math.min(5, 3 + ((destinationIndex + hotelIndex) % 3)),
        destination: destination.city,
        country: destination.country,
        countryCode: destination.countryCode,
        departure: DEPARTURES[sequence % DEPARTURES.length],
        dates: window.dates,
        nights: window.nights,
        flight: `${destination.airlines[hotelIndex]} · ${destination.duration} · ${
          destination.connection ?? (sequence % 7 === 0 ? "1 przesiadka" : "bezpośredni")
        }`,
        price: destination.basePrice + hotelIndex * 280 + (destinationIndex % 4) * 70,
        images,
        amenities: AMENITY_SETS[sequence % AMENITY_SETS.length],
      };
    }),
);
