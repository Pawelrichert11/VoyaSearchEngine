const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const inputPath = process.argv[2] || 'output/offers.json';
const outputPath = process.argv[3] || 'output/outdoor_pool_check.json';

const outdoorPatterns = [
  /\boutdoor swimming pool\b/i,
  /\boutdoor pool\b/i,
  /\bseasonal outdoor pool\b/i,
  /\bbasen odkryty\b/i,
  /\bodkryty basen\b/i,
  /\bbasen zewn[eę]trzny\b/i,
  /\bpiscina exterior\b/i,
  /\bpiscina al aire libre\b/i,
  /\bpiscina descubierta\b/i,
  /\bpiscina abierta\b/i
];

const indoorPatterns = [
  /\bindoor swimming pool\b/i,
  /\bindoor pool\b/i,
  /\bbasen kryty\b/i,
  /\bkryty basen\b/i,
  /\bbasen wewn[eę]trzny\b/i,
  /\bpiscina cubierta\b/i,
  /\bpiscina interior\b/i
];

function detectOutdoorPool(text) {
  const source = text || '';
  const outdoor = outdoorPatterns.find((pattern) => pattern.test(source));
  if (outdoor) return { hasOutdoorPool: true, evidence: outdoor.toString() };
  const indoor = indoorPatterns.find((pattern) => pattern.test(source));
  if (indoor) return { hasOutdoorPool: false, evidence: `indoor-only-text:${indoor.toString()}` };
  return { hasOutdoorPool: null, evidence: '' };
}

function flattenItems(data) {
  if (!Array.isArray(data)) return [];
  const flat = [];
  for (const item of data) {
    if (item.hotel_link) {
      flat.push(item);
      continue;
    }
    if (Array.isArray(item.hotels)) {
      for (const hotel of item.hotels) flat.push({ ...hotel, flight: item.flight });
    }
  }
  return flat;
}

(async () => {
  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const items = flattenItems(raw).filter((item) => item.hotel_link);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    locale: 'pl-PL',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'
  });

  const results = [];
  for (const item of items) {
    const page = await context.newPage();
    const result = { ...item, has_outdoor_pool: null, outdoor_evidence: '', page_title: '', error: '' };
    try {
      await page.goto(item.hotel_link, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1800);
      result.page_title = await page.title().catch(() => '');
      const text = await page.locator('body').innerText({ timeout: 10000 }).catch(() => '');
      let detected = detectOutdoorPool(text);
      if (detected.hasOutdoorPool === null) {
        const html = await page.content().catch(() => '');
        const htmlDetected = detectOutdoorPool(html);
        detected = htmlDetected.evidence ? { hasOutdoorPool: htmlDetected.hasOutdoorPool, evidence: `html:${htmlDetected.evidence}` } : detected;
      }
      result.has_outdoor_pool = detected.hasOutdoorPool;
      result.outdoor_evidence = detected.evidence;
    } catch (error) {
      result.error = error.message;
    }
    await page.close().catch(() => {});
    console.log(`${item.row || item.hotel_name || item.name || item.dest_name}: ${result.has_outdoor_pool} ${result.outdoor_evidence || result.error}`);
    results.push(result);
  }

  await browser.close();
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
})();
