# Conversation Summary - VoyaSearchEngine

Data podsumowania: 2026-07-08

## Cel projektu

Projekt `VoyaSearchEngine` powstal jako lokalny system do wyszukiwania ofert wakacyjnych:

- tanie loty,
- hotele lub apartamenty,
- finalna cena wyjazdu,
- basen w obiekcie,
- pozniej proste UI do przegladania wynikow.

Wazne: wyeksportowany silnik w tym projekcie zawiera tylko elementy bez AI.

## Co zostalo zrobione

### Backend bez AI

W folderze `src` sa skrypty do:

- pobierania wynikow hoteli z Agody przez Playwright,
- sprawdzania stron lotow,
- tekstowej weryfikacji basenu odkrytego,
- zbierania zdjec hotelu do recznego podgladu,
- budowania katalogu ofert w JSON.

Nie ma tu modeli jezykowych, vision ani automatycznej oceny "fajnosci" miejsca.

### UI

Repozytorium UI zostalo pobrane z:

https://github.com/Pawelrichert11/fly-finder-vibes

Kod UI znajduje sie w:

`C:\Users\pawel\Desktop\VoyaSearchEngine\ui`

Podlaczone MVP:

- lista wynikow czyta dane z `output/offers.json`,
- szczegoly oferty czytaja ten sam model danych,
- endpoint dev-servera `/api/voya/offers` zwraca lokalne oferty,
- endpoint `/api/voya/search` moze odpalic jedno ograniczone wyszukiwanie.

## Jak odpalic w przegladarce

Najprosciej:

1. Wejdz do folderu:

   `C:\Users\pawel\Desktop\VoyaSearchEngine`

2. Dwuklik w:

   `START_VOYA_UI.bat`

3. Otworzy sie:

   `http://127.0.0.1:5173/results/demo`

Ten plik:

- instaluje zaleznosci UI, jesli ich brakuje,
- odpala dev server, jesli jeszcze nie dziala,
- otwiera przegladarke,
- nie odpala scrapera Agody.

Alternatywnie z terminala:

```powershell
cd C:\Users\pawel\Desktop\VoyaSearchEngine
npm run ui:dev
```

## Najwazniejsze pliki

- `.docs` - techniczna dokumentacja MVP.
- `README.md` - opis silnika wyszukiwania bez AI.
- `package.json` - komendy dla backendu i UI.
- `src/agoda_search.js` - ograniczony scraper Agody.
- `src/build_offers.py` - budowanie listy ofert w JSON.
- `ui/src/lib/voya-search.ts` - mapowanie danych backendu do UI.
- `ui/vite.config.ts` - lokalne endpointy `/api/voya/*`.
- `START_VOYA_UI.bat` / `START_VOYA_UI.ps1` - start UI z dwukliku.
- `output/offers.json` - plik z ofertami czytany przez UI.

## Komendy

Instalacja UI:

```powershell
npm run ui:install
```

Start UI:

```powershell
npm run ui:dev
```

Build UI:

```powershell
npm run ui:build
```

Ograniczone pobranie Agody:

```powershell
npm run agoda:limited
npm run build:mvp
```

## Ograniczenia i ostroznosc

Agody nie nalezy odpytywac masowo.

W UI endpoint `/api/voya/search` ma zabezpieczenia:

- domyslnie bierze tylko 1 lot,
- domyslnie wykonuje tylko 1 scroll,
- ma guard 30 minut w `output/.ui-search-last.json`,
- drugi klik w tym czasie nie odpali kolejnego scrapowania.

Nie bylo obchodzenia CAPTCHA, logowania ani checkoutu.

## Aktualny stan

UI bylo uruchomione lokalnie pod:

`http://127.0.0.1:5173`

Endpoint:

`http://127.0.0.1:5173/api/voya/offers`

dziala i czyta `output/offers.json`.

Jesli `output/offers.json` nie istnieje, UI pokazuje fallback/demo bez komunikatu technicznego dla uzytkownika.

## Decyzje projektowe

- Agoda zostala uzyta zamiast Bookingu, bo latwiej bylo przechwycic uporzadkowane dane JSON/GraphQL.
- Booking moze byc lepszy do recznej weryfikacji koncowej, ale trudniejszy do stabilnej automatyzacji.
- Projekt ma byc MVP, nie pelny produkt.
- Priorytetem jest lokalne uzycie i szybkie przegladanie ofert, a nie masowe scrapowanie.
