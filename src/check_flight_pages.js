const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const inputPath = process.argv[2] || 'examples/flights.sample.json';
const outputPath = process.argv[3] || 'output/flight_page_checks.json';

function priceStrings(text) {
  const matches = new Set();
  const patterns = [
    /\b\d{1,4}\s*,\s*\d{2}\s*zł\b/gi,
    /\bzł\s*\d{1,4}\s*,\s*\d{2}\b/gi,
    /\b\d{1,4}\s*\.\s*\d{2}\s*zł\b/gi
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) matches.add(match[0].replace(/\s+/g, ' ').trim());
  }
  return Array.from(matches);
}

function buildRyanairLink(flight) {
  if (flight.flight_link) return flight.flight_link;
  return (
    'https://www.ryanair.com/pl/pl/trip/flights/select?' +
    `adults=4&teens=0&children=0&infants=0&dateOut=${flight.depart}&dateIn=${flight.return}` +
    `&originIata=${flight.origin_iata}&destinationIata=${flight.dest_iata}` +
    '&isConnectedFlight=false&isReturn=true&discount=0&promoCode='
  );
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

  const output = [];
  for (const flight of flights) {
    const page = await context.newPage();
    const url = /ryanair/i.test(flight.airline || '') ? buildRyanairLink(flight) : flight.flight_link;
    const responses = [];
    page.on('response', (response) => {
      const responseUrl = response.url();
      if (/availability|booking|select-flight|api/i.test(responseUrl)) {
        responses.push({ status: response.status(), url: responseUrl.slice(0, 220) });
      }
    });

    const result = { ...flight, checked_url: url, final_url: '', title: '', visible_prices: [], body_excerpt: '', responses, error: '' };
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(12000);
      result.final_url = page.url();
      result.title = await page.title().catch(() => '');
      const text = (await page.locator('body').innerText({ timeout: 5000 }).catch(() => '')).replace(/\s+/g, ' ');
      result.visible_prices = priceStrings(text);
      result.body_excerpt = text.slice(0, 2500);
    } catch (error) {
      result.error = error.message;
    }
    await page.close().catch(() => {});
    console.log(`${flight.origin_iata}-${flight.dest_iata} ${flight.depart}/${flight.return}: ${result.visible_prices.join(' | ') || result.error || 'no prices'}`);
    output.push(result);
  }

  await browser.close();
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
})();
