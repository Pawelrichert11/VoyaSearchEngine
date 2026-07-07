const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const inputPath = path.resolve(process.argv[2] || 'examples/flights.sample.json');
const outputPath = path.resolve(process.argv[3] || 'output/agoda_results.json');
const usePoolFilter = !process.argv.includes('--no-pool-filter');

function argValue(name, fallback) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const scrolls = Number(argValue('--scrolls', 18));
const rooms = Number(argValue('--rooms', 2));
const adults = Number(argValue('--adults', 4));
const currency = argValue('--currency', 'PLN');
const facility = argValue('--facility', '93');

function getNested(obj, parts) {
  return parts.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function priceFromProperty(property) {
  const prices = [];
  const offers = getNested(property, ['pricing', 'offers']) || [];
  for (const offer of offers) {
    for (const roomOffer of offer.roomOffers || []) {
      const room = roomOffer.room || {};
      for (const pricing of room.pricing || []) {
        const value = getNested(pricing, ['price', 'perBook', 'inclusive', 'display']);
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) prices.push(value);
      }
    }
  }
  return prices.length ? Math.min(...prices) : null;
}

function propertyToHotel(property, flight) {
  const info = getNested(property, ['content', 'informationSummary']) || {};
  const reviews = getNested(property, ['content', 'reviews', 'cumulative']) || {};
  const totalPrice = priceFromProperty(property);
  const linkPath = getNested(info, ['propertyLinks', 'propertyPage']);
  return {
    property_id: property.propertyId,
    hotel_name: info.displayName || info.propertyName || info.name || '',
    hotel_area: getNested(info, ['address', 'area', 'name']) || '',
    property_type: info.propertyType || '',
    accommodation_type: info.accommodationType || null,
    stars: info.rating || null,
    review_score: reviews.score || null,
    review_count: reviews.reviewCount || null,
    hotel_total_price: totalPrice,
    hotel_price_per_person: totalPrice ? Math.round((totalPrice / adults) * 100) / 100 : null,
    hotel_link: linkPath
      ? `https://www.agoda.com${linkPath}?checkIn=${flight.depart}&los=${flight.nights}&rooms=${rooms}&adults=${adults}&children=0&currency=${currency}`
      : '',
    source: 'Agoda'
  };
}

function isAllowed(hotel) {
  if (!hotel.hotel_name || !hotel.hotel_total_price) return false;
  const name = hotel.hotel_name.toLowerCase();
  return !['hostel', 'hostal', 'camping', 'camper', 'camps'].some((term) => name.includes(term));
}

async function fetchFlight(context, flight) {
  const page = await context.newPage();
  const byId = new Map();
  const batches = [];

  page.on('response', async (response) => {
    try {
      if (!response.url().includes('/graphql/search')) return;
      const post = response.request().postData() || '';
      if (!post.includes('citySearch')) return;
      const data = JSON.parse(await response.text());
      const properties = getNested(data, ['data', 'citySearch', 'properties']) || [];
      batches.push(properties.length);
      for (const property of properties) {
        if (property.propertyId) byId.set(property.propertyId, property);
      }
    } catch (_) {
      // Ignore opaque, partial or transient responses.
    }
  });

  const url =
    `https://www.agoda.com/search?city=${flight.agoda_city_id}` +
    `&checkIn=${flight.depart}&checkOut=${flight.return}` +
    `&rooms=${rooms}&adults=${adults}&currency=${currency}` +
    (usePoolFilter ? `&hotelFacility=${facility}` : '');

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  for (let i = 0; i < scrolls; i += 1) {
    await page.mouse.wheel(0, 1800);
    await page.waitForTimeout(1200);
  }
  await page.close().catch(() => {});

  const hotels = Array.from(byId.values()).map((property) => propertyToHotel(property, flight)).filter(isAllowed);
  hotels.sort((a, b) => (a.hotel_price_per_person || 999999) - (b.hotel_price_per_person || 999999));
  return { flight, url, pool_filter: usePoolFilter, response_batches: batches, unique_properties: byId.size, hotels };
}

(async () => {
  const flights = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    locale: 'pl-PL',
    viewport: { width: 1400, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126 Safari/537.36'
  });

  const results = [];
  for (const flight of flights) {
    const result = await fetchFlight(context, flight);
    console.log(`${flight.origin_iata || flight.origin} ${flight.dest_iata}: ${result.hotels.length}/${result.unique_properties} batches=${result.response_batches.join(',')}`);
    results.push(result);
  }

  await browser.close();
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
})();
