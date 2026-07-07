# VoyaSearchEngine

To jest wyeksportowana, nie-AI czesc systemu wyszukiwania ofert wakacyjnych.

Projekt nie uzywa modeli jezykowych, vision ani zadnego scoringu AI. Robi tylko:

- odpalenie stron w Playwright,
- zebranie wynikow hoteli z requestow Agody,
- opcjonalne sprawdzenie stron hoteli regexami pod katem basenu odkrytego,
- policzenie `Cena total = Lot cena + Hotel cena per osoba`,
- filtrowanie po datach, cenie, liczbie dni i typie obiektu,
- eksport do JSON/XLSX.

## Czego tu nie ma

- Nie ma oceny czy miejsce jest imprezowe/fajne.
- Nie ma rozpoznawania basenu na zdjeciach przez AI.
- Nie ma automatycznej decyzji "najlepsza oferta" poza sortowaniem po cenie i ocenach.
- Nie ma Twoich prywatnych arkuszy, notatek ani vote'ow.

## Instalacja

W PowerShellu:

```powershell
cd "$env:USERPROFILE\Desktop\VoyaSearchEngine"
npm install
python -m pip install -r requirements.txt
```

Jesli Playwright nie widzi Chrome, ustaw sciezke:

```powershell
$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

## Format wejscia lotow

Zobacz [examples/flights.sample.json](examples/flights.sample.json).

Wymagane pola dla kazdego lotu:

- `origin`, `origin_iata`
- `dest_iata`, `dest_name`
- `agoda_city_id`
- `depart`, `return`
- `days`, `nights`
- `flight_price`
- `flight_link`

`agoda_city_id` mozna znalezc z adresu/strony miasta Agody albo z requestow przegladarki.

## Workflow

1. Sprawdz linki lotow i widoczne ceny:

```powershell
npm run flight:check
```

2. Pobierz hotele z Agody z filtrem basenu:

```powershell
npm run agoda
```

Albo bez filtra basenu:

```powershell
npm run agoda:no-pool-filter
```

3. Zbuduj oferty i arkusz:

```powershell
npm run build
```

4. Zweryfikuj tekstowo basen odkryty na stronach hoteli:

```powershell
npm run verify:pools
```

5. Opcjonalnie zrob contact sheet ze zdjeciami hoteli:

```powershell
npm run photos
```

## Przyklad pelnej komendy eksportu

```powershell
python src/build_offers.py `
  --hotel-results output/agoda_results.json `
  --out-json output/offers.json `
  --out-xlsx output/offers.xlsx `
  --max-total 2500 `
  --return-date 2026-08-08 `
  --min-days 9
```

Dodatkowe filtry:

```powershell
python src/build_offers.py `
  --hotel-results output/agoda_results.json `
  --pool-check output/offers_outdoor_pool_check.json `
  --confirmed-outdoor-only `
  --hotel-only `
  --out-xlsx output/offers_confirmed_hotels.xlsx
```

## Uwagi praktyczne

- Ceny sa nietrwale. Po paru minutach lub godzinach Ryanair/Wizzair/Agoda moga pokazac inne ceny.
- Agoda czasem pokazuje `pool`, ale nie rozroznia basenu krytego i odkrytego. Do tego sluzy `verify_outdoor_pool.js`, ale to nadal tylko tekst/HTML, nie analiza zdjec.
- Booking/Agoda moga blokowac lub zmieniac HTML. Skrypty sa narzedziami roboczymi, nie stabilnym API.
